import { Injectable } from '@nestjs/common';
import { PgService } from './pg';
import {
  TxBalanceMsg,
  ITokenBalance,
  PgTokenPrevBalance,
  PG_CMD,
} from './models';
import { FSN_TOKEN1 } from './constant';
import { CustomLogger } from './common';
import { TokenService } from './token';
import { RedisHelperService } from './redis-helper';
import { WorkerClientService } from './worker-client/worker-client.service';

@Injectable()
export class AppService extends CustomLogger {
  constructor(
    private pg: PgService,
    private token: TokenService,
    private redis: RedisHelperService,
    private workerClient: WorkerClientService,
  ) {
    super('AppService');
  }

  async processBalanceMsgInBatch(msgs: TxBalanceMsg[]) {
    const provider = this.pg.getTrxProvider();
    const trx = await provider();
    const promises = msgs.map(msg => this.getMsgBalances(msg));
    const holdersRecords = await Promise.all(promises).then(results => {
      const tokenHoldersBalances = [];
      results.map(result => tokenHoldersBalances.push(...result));
      return tokenHoldersBalances;
    });

    const getOperationPromises = holdersRecords.map(item =>
      this.getAddressBalancesOperation(item, provider),
    );
    return Promise.all(getOperationPromises)
      .then(operations => this.trackBalanceRecords(operations, provider))
      .then(res => {
        if (res) trx.commit();
        else trx.rollback();
        return res;
      })
      .catch(e => {
        this.logError({ method: 'processBalanceMsgs', e });
        trx.rollback();
        return false;
      });
  }

  private getMsgBalances(msg: TxBalanceMsg): Promise<Partial<ITokenBalance>[]> {
    const { address } = msg;
    const getTlBalances = this.getHoldersTlBalances(
      address,
      this.delInvalidAsset(msg.tlTokens),
    );
    const getBalances = this.getHoldersBalances(
      address,
      this.delInvalidAsset(msg.tokens),
    );
    return Promise.all([getTlBalances, getBalances]).then(data => {
      let [tlBalancesMap, balancesMap] = data;
      Object.keys(tlBalancesMap).map(token => {
        const { qty_in } = tlBalancesMap[token];
        if (qty_in !== undefined) {
          if (balancesMap[token]) balancesMap[token].qty_in = qty_in;
          else balancesMap[token] = { address, token, qty_in };
        }
        delete tlBalancesMap[token];
      });
      tlBalancesMap = null;
      return Object.keys(balancesMap).map(token => balancesMap[token]);
    });
  }

  private async getHoldersTlBalances(
    address: string,
    tokens: string[],
  ): Promise<{ [key: string]: Partial<ITokenBalance> }> {
    const balanceMap = {};
    if (!tokens.length) return balanceMap;
    const tokensToTrack: string[] = [];
    const tokensToTrackPromises = tokens.map(token => {
      return this.checkTlPair({ token, address }).then(res => {
        if (!res) tokensToTrack.push(token);
      });
    });

    await Promise.all(tokensToTrackPromises);
    if (tokensToTrack.length === 0) return {};

    const promises = tokensToTrack.map(token =>
      this.token.getTokenTlBalance({ address, token }),
    );
    return Promise.all(promises)
      .then(data => {
        data.map(tlBalance => {
          const { token, qty_in } = tlBalance;
          balanceMap[token] = { token, address, qty_in };
        });
        return balanceMap;
      })
      .catch(e => {
        this.logError({ method: 'getHolderTlbalances', e });
        return balanceMap;
      });
  }

  private async getHoldersBalances(
    address: string,
    tokens: string[],
  ): Promise<{ [key: string]: Partial<ITokenBalance> }> {
    const balanceMap = {};
    if (!tokens.length) return balanceMap;

    const tokensToTrack = [];
    const checkCachePromises = tokens.map(token => {
      return this.checkBalancePair({ token, address }).then(res => {
        if (!res) tokensToTrack.push(token);
      });
    });
    await Promise.all(checkCachePromises);
    if (tokensToTrack.length === 0) return balanceMap;

    const promises = tokensToTrack.map(token =>
      this.token.getTokenBalance({ address, token }),
    );
    return Promise.all(promises).then(data => {
      data.map(balance => {
        if (!balance) return;
        const { token, qty } = balance;
        balanceMap[token] = { token, address, qty };
      });
      return balanceMap;
    });
  }

  private async getAddressBalancesOperation(
    recordToTrack: ITokenBalance,
    provider: any,
  ): Promise<{ record: Partial<ITokenBalance>; cmd: string }> {
    const { address, token, ...others } = recordToTrack;
    return this.pg
      .checkExistence({ address, token }, provider)
      .then(prevRecord => {
        let cmd: string = '';
        const qtyOwn = this.calcQtyOwn(recordToTrack, prevRecord);
        if (!prevRecord && qtyOwn) cmd = PG_CMD.create;
        if (prevRecord && !qtyOwn) cmd = PG_CMD.del;
        if (prevRecord && qtyOwn) cmd = PG_CMD.update;

        const record: Partial<ITokenBalance> = {
          address,
          token,
          qty_own: qtyOwn,
          ...others,
        };
        // erc20 token doesn't have qty_own property
        if (this.token.isErc20Hash(token)) delete record.qty_own;
        return { record, cmd };
      });
  }

  private async trackBalanceRecords(
    tracks: { record: Partial<ITokenBalance>; cmd: string }[],
    provider: any,
  ) {
    const promises = tracks.map(
      (track: { record: ITokenBalance; cmd: string }) => {
        const { record, cmd } = track;
        const { token, address } = record;
        const noUpdateRes = { token, address, count: 0 };
        if (!cmd) return Promise.resolve(noUpdateRes);
        if (cmd === PG_CMD.create) {
          return this.pg.createBalanceRecord(record, provider).then(res => {
            if (res) {
              this.cachePairProcessingForOneBlockTime(record);
              return { token, address, count: 1 };
            } else process.exit();
          });
        }
        if (cmd === PG_CMD.update) {
          return this.pg.updateBalanceRecord(record, provider).then(res => {
            if (res) {
              this.cachePairProcessingForOneBlockTime(record);
              return noUpdateRes;
            } else process.exit();
          });
        }
        if (cmd === PG_CMD.del) {
          return this.pg
            .delBalanceRecord({ token, address }, provider)
            .then(res => {
              if (res) {
                this.cachePairProcessingForOneBlockTime(record);
                return { token, address, count: -1 };
              } else process.exit();
            });
        }
      },
    );

    return Promise.all(promises)
      .then(results => {
        let tokenStatsMap = {};
        let addressStatsMap = {};
        results.map(result => {
          const { token, address, count } = result;
          if (tokenStatsMap[token]) tokenStatsMap[token].count += count;
          else tokenStatsMap[token] = { token, count };
          if (addressStatsMap[address]) {
            if (token.length === 42) addressStatsMap[address].erc20 += count;
            else addressStatsMap[address].fusion += count;
          } else {
            if (token.length === 42) {
              addressStatsMap[address] = { address, erc20: count, fusion: 0 };
            } else
              addressStatsMap[address] = { address, fusion: count, erc20: 0 };
          }
        });

        const tokenMsgs = Object.keys(tokenStatsMap).map(
          tokenKey => tokenStatsMap[tokenKey],
        );
        const addressMsgs = Object.keys(addressStatsMap).map(
          addressKey => addressStatsMap[addressKey],
        );
        if (tokenMsgs.length) {
          this.workerClient.notifyTokenHoldersChange(tokenMsgs);
        }
        if (addressMsgs.length) {
          this.workerClient.notifyAddressHoldingsChange(addressMsgs);
        }

        Object.keys(tokenStatsMap).map(key => delete tokenStatsMap[key]);
        Object.keys(addressStatsMap).map(key => delete addressStatsMap[key]);

        tokenStatsMap = null;
        addressStatsMap = null;
        return true;
      })
      .catch(e => {
        this.logError({ method: 'trackBalanceRecords', e });
        console.log(e);
        console.log(this.trackBalanceRecords);
        console.log(`\n\n`);
        return false;
      });
  }

  private calcQtyOwn(
    newBalance: Partial<ITokenBalance>,
    prevBalance?: Partial<PgTokenPrevBalance>,
  ): number {
    if (!prevBalance) {
      const { qty = 0, qty_in = 0 } = newBalance;
      return qty + qty_in;
    }

    const { qty, qty_in } = newBalance;
    const prevQty = +prevBalance.qty || 0;
    const prevQtyIn = +prevBalance.qty_in || 0;

    const newQty = qty === undefined ? prevQty : qty;
    const newQtyIn = qty_in === undefined ? prevQtyIn : qty_in;

    return newQty + newQtyIn;
  }

  private delInvalidAsset(assets: string[]): string[] {
    const assetsData = assets || [];
    const validAssets = assetsData.filter(asset => asset !== FSN_TOKEN1);
    return [...new Set(validAssets)];
  }

  private cachePairProcessingForOneBlockTime(record: Partial<ITokenBalance>) {
    const { token, address, qty, qty_in } = record;
    if (qty) this.cacheBalancePair({ token, address });
    if (qty_in !== undefined) this.cacheTlPair({ token, address });
  }

  private checkTlPair(pair: { token: string; address: string }) {
    return this.checkPair('tl_balance', pair);
  }

  private checkBalancePair(pair: { token: string; address: string }) {
    return this.checkPair('balance', pair);
  }

  private cacheTlPair(pair: { token: string; address: string }) {
    return this.cachePair('tl_balance', pair);
  }

  private cacheBalancePair(pair: { token: string; address: string }) {
    this.cachePair('balance', pair);
  }

  private getPairKey(
    type: string,
    pair: { token: string; address: string },
  ): string {
    const { token, address } = pair;
    const key = `${type}:${address}:${token}`;
    if (type === 'balance') return key;
    else return key;
  }

  private checkPair(
    type: string,
    pair: { token: string; address: string },
  ): Promise<boolean> {
    const key = this.getPairKey(type, pair);
    return this.redis.getCachedValue(key).then(val => !!val);
  }

  private cachePair(type: string, pair: { token: string; address }): void {
    const key = this.getPairKey(type, pair);
    this.redis.cacheValue(key, JSON.stringify(true), 3);
  }
}
