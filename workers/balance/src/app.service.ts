import { Injectable } from '@nestjs/common';
import { PgService } from './pg';
import {
  TxBalanceMsg,
  ITokenBalance,
  PgTokenPrevBalance,
  PG_CMD,
  AddresBalancesOperation,
  PAIR_TYPE,
} from './models';
import { FSN_TOKEN1 } from './constant';
import { TokenService } from './token';
import { WorkerClientService } from './worker-client';
import { HelperService, RedisHelperService } from './common';

@Injectable()
export class AppService {
  constructor(
    private readonly pg: PgService,
    private readonly token: TokenService,
    private readonly redis: RedisHelperService,
    private readonly workerClient: WorkerClientService,
    private readonly helper: HelperService,
  ) {}

  /**
   * Save/Update/Del address balances to PostgreSQL
   * @param msgs: {address:string, tokens?: [], tl_tokens?:string[]}[]
   * @returns boolean. true: operations is done, false: opertion is failed
   */
  async processBalanceMsgInBatch(msgs: TxBalanceMsg[]) {
    const provider = this.pg.getTrxProvider();
    const trx = await provider();
    const promises = msgs.map(msg => this.getMsgBalances(msg));
    const rawRecords = await Promise.all(promises).then(results => {
      const tokenHoldersBalances = [];
      results.map(result => tokenHoldersBalances.push(...result));
      return tokenHoldersBalances;
    });

    const holdersRecords = rawRecords.filter(record => {
      const { qty, qty_in, data } = record;

      // no qty, data, or qty_in, an invalid record
      if (qty !== undefined || qty_in !== undefined || data !== undefined) {
        return record;
      }
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
        this.helper.logError({ method: 'processBalanceMsgs', e });
        trx.rollback();
        return false;
      });
  }

  /**
   * Get address balance record/s
   * @param msg: TxBalanceMsg
   * @returns {token:string, address:string, qty?:number,qty_in?:number, data?:any}
   * */
  private getMsgBalances(msg: TxBalanceMsg): Promise<Partial<ITokenBalance>[]> {
    const { address, tokens = [], tlTokens = [] } = msg;
    const getTlBalances = this.getHoldersTlBalances(
      address,
      this.delInvalidAsset(tlTokens),
    );
    const getBalances = this.getHoldersBalances(
      address,
      this.delInvalidAsset(tokens),
    );
    return Promise.all([getTlBalances, getBalances]).then(data => {
      let [tlBalancesMap, balancesMap] = data;
      Object.keys(tlBalancesMap).map(token => {
        const { qty_in, data = null } = tlBalancesMap[token];
        if (qty_in !== undefined) {
          if (balancesMap[token]) balancesMap[token].qty_in = qty_in;
          else balancesMap[token] = { address, token, qty_in };
          delete tlBalancesMap[token].qty_in;
        }
        if (data) {
          if (balancesMap[token]) balancesMap[token].data = data;
          else balancesMap[token] = { address, token, data };
        }
        delete tlBalancesMap[token];
      });
      tlBalancesMap = null;
      return Object.keys(balancesMap).map(token => balancesMap[token]);
    });
  }

  /**
   * Get address timeblock balances for a timelock balance update message
   * @param address:string
   * @param tokens: string[], can either be erc20 token or native token
   */
  private async getHoldersTlBalances(
    address: string,
    tokens: string[],
  ): Promise<{ [token: string]: Partial<ITokenBalance> }> {
    const balanceMap = {};
    if (!tokens.length) return balanceMap;
    const tokensToTrack: string[] = [];
    const tokensToTrackPromises = tokens.map(token => {
      return this.checkPair(PAIR_TYPE.tl_balance, { token, address }).then(
        res => {
          if (!res) tokensToTrack.push(token);
        },
      );
    });

    await Promise.all(tokensToTrackPromises);
    if (tokensToTrack.length === 0) return {};

    const promises = tokensToTrack.map(token =>
      this.token.getTokenTlBalance({ address, token }),
    );
    return Promise.all(promises)
      .then(tlBalances => {
        tlBalances.map(tlBalance => {
          if (!tlBalance) return;
          const { token, qty_in, data } = tlBalance;
          if (qty_in !== undefined) {
            if (balanceMap[token]) {
              balanceMap[token].qty_in = qty_in;
            } else {
              balanceMap[token] = { qty_in };
            }
          }
          if (data) {
            if (balanceMap[token]) balanceMap[token].data = data;
            else balanceMap[token] = { data };
          }
        });
        return balanceMap;
      })
      .catch(e => {
        this.helper.logError({ method: 'getHolderTlbalances', e });
        return balanceMap;
      });
  }

  /**
   * Get address balances for a balance update message
   * @param address:string
   * @param tokens: string[], can either be erc20 token or native token
   */
  private async getHoldersBalances(
    address: string,
    tokens: string[],
  ): Promise<{ [token: string]: Partial<ITokenBalance> }> {
    const balanceMap = {};
    if (!tokens.length) return balanceMap;

    const tokensToTrack = [];
    const checkCachePromises = tokens.map(token => {
      return this.checkPair(PAIR_TYPE.balance, { token, address }).then(res => {
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
        if (balance) {
          const { token, qty } = balance;
          balanceMap[token] = { token, address, qty };
        }
      });
      return balanceMap;
    });
  }

  /***
   * Get the operation of a holder(address, token) pair
   * @param recordToTrack: ITokenBalance
   * @returns AddressBalanceOperation
   */
  private async getAddressBalancesOperation(
    recordToTrack: ITokenBalance,
    provider: any,
  ): Promise<AddresBalancesOperation> {
    const { address, token, data, qty = undefined } = recordToTrack;
    return this.pg
      .checkExistence({ address, token }, provider)
      .then(prevRecord => {
        let cmd: any = PG_CMD.nil;
        let count = 0;
        let type: string;
        if (data) type = PAIR_TYPE.tl_balance;
        if (qty !== undefined) type = PAIR_TYPE.balance;
        const qtyOwn = this.calcQtyOwn(recordToTrack, prevRecord);
        const saveRecord = qtyOwn || data;
        if (!prevRecord && saveRecord) {
          cmd = PG_CMD.create;
          if (qtyOwn) count = 1;
        }
        if (prevRecord && !saveRecord) {
          cmd = PG_CMD.del;
          if (prevRecord.qty_own) {
            count = -1;
          }
        }
        if (prevRecord && saveRecord) {
          cmd = PG_CMD.update;
          if (prevRecord.qty_own && qtyOwn) {
            count = 1;
          }
        }

        let token_type: number;
        if (this.token.isErc20Token(token)) {
          token_type = 1;
        } else {
          token_type = 0;
        }
        const record: Partial<ITokenBalance> = {
          ...recordToTrack,
          qty_own: qtyOwn,
          token_type,
        };
        // erc20 token doesn't have qty_own and data properties
        if (this.token.isErc20Token(token)) {
          delete record.qty_in;
          delete record.data;
        }

        // it doesn't matter if we can't the type
        return { record, cmd, change: count, type };
      });
  }

  /**
   * Save/Create/Update/Delete a token, address pair to PostgreSQL database
   * @param tracks: AddresBalancesOperation[],
   * @param provider: Database transaction provider
   * @returns boolean
   */
  private async trackBalanceRecords(
    tracks: AddresBalancesOperation[],
    provider: any,
  ) {
    const promises = tracks.map(async (track: AddresBalancesOperation) => {
      const { record, cmd, ...trackResult } = track;
      const { token, address } = record;
      const noUpdateRes = { token, address, ...trackResult };
      if ((cmd as any) == PG_CMD.nil) return noUpdateRes;
      if (cmd === PG_CMD.create) {
        return this.pg.createHolderRecord(record, provider).then(res => {
          if (res) {
            return { token, address, ...trackResult };
          } else process.exit();
        });
      }
      if (cmd === PG_CMD.update) {
        return this.pg.updateHolderRecord(record, provider).then(res => {
          if (res) {
            return { token, address, ...trackResult };
          } else process.exit();
        });
      }
      if (cmd === PG_CMD.del) {
        return this.pg
          .delHolderRecord({ token, address }, provider)
          .then(res => {
            if (res) {
              return { token, address, ...trackResult };
            } else process.exit();
          });
      }
    });

    return Promise.all(promises)
      .then(async operations => {
        const results = await Promise.all(operations);
        let tokenStatsMap = {};
        let addressStatsMap = {};
        results.map(result => {
          const { token, address, change, type } = result;
          // stats holder's change for a token
          if (tokenStatsMap[token]) {
            tokenStatsMap[token].change += change;
          } else {
            tokenStatsMap[token] = { token, change };
          }
          // stats holding types change for an address
          if (addressStatsMap[address]) {
            addressStatsMap[address].change += change;
          } else {
            addressStatsMap[address] = { address, change };
          }
          if (type) {
            this.cachePair(type, { token, address });
          }
        });

        const tokenMsgs = [];
        Object.keys(tokenStatsMap).map(key => {
          const { count } = tokenStatsMap[key];
          if (count) tokenMsgs.push(tokenStatsMap[key]);
        });

        const addressMsgs = [];
        Object.keys(addressStatsMap).map(key => {
          const { count } = addressStatsMap[key];
          if (count) addressMsgs.push(addressMsgs[key]);
        });
        if (tokenMsgs.length) {
          this.workerClient.notifyTokenHoldersChange(tokenMsgs);
        }
        if (addressMsgs.length) {
          this.workerClient.notifyAddressHoldingsChange(addressMsgs);
        }

        // I worry if it causes an error because of releasing memory
        Object.keys(tokenStatsMap).map(key => delete tokenStatsMap[key]);
        Object.keys(addressStatsMap).map(key => delete addressStatsMap[key]);
        tokenStatsMap = null;
        addressStatsMap = null;

        return true;
      })
      .catch(e => {
        this.helper.logError({ method: 'trackBalanceRecords', e });
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
    const prevQty = prevBalance.qty || 0;
    const prevQtyIn = prevBalance.qty_in || 0;

    const newQty = qty === undefined ? prevQty : qty;
    const newQtyIn = qty_in === undefined ? prevQtyIn : qty_in;

    return newQty + newQtyIn;
  }

  private delInvalidAsset(assets: string[]): string[] {
    const assetsData = assets || [];
    const validAssets = assetsData.filter(asset => asset !== FSN_TOKEN1);
    return [...new Set(validAssets)];
  }

  private getPairKey(
    type: string,
    pair: { token: string; address: string },
  ): string {
    const { token, address } = pair;
    const key = `${type}:${address}:${token}`;
    return key;
  }

  private checkPair(
    type: string,
    pair: { token: string; address: string },
  ): Promise<boolean> {
    const key = this.getPairKey(type, pair);
    return this.redis.getCachedValue(key).then(val => !!val);
  }

  private cachePair(
    type: string,
    pair: { token: string; address: string },
  ): void {
    const key = this.getPairKey(type, pair);
    this.redis.cacheValue(key, JSON.stringify(true), 13);
  }
}
