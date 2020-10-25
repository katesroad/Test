import { Injectable } from '@nestjs/common';
import { PgService } from './pg/pg.service';
import {
  TokenTxsCountMsg,
  TokenInfo,
  TokenHoldersCountMsg,
  TokenErc20Msg,
  Tokenstats,
  DB_CMD,
  DbOperation,
} from './models';
import { CustomLogger } from './common';
import { TokenService } from './token';
import { RedisHelperService } from './redis-helper';

@Injectable()
export class AppService extends CustomLogger {
  constructor(
    private pg: PgService,
    private token: TokenService,
    private readonly redis: RedisHelperService,
  ) {
    super('AppService');
  }

  async trackTokensStatsInBatch(msgs: TokenTxsCountMsg[]): Promise<boolean> {
    if (msgs.length === 0) return true;
    const provider = this.pg.getTrxProvider();
    const getOperations = msgs.map(stats =>
      this.getTokenStatsOperation(stats, provider),
    );
    const operations: DbOperation[] = await Promise.all(
      getOperations,
    ).catch(e => []);

    if (operations.length === 0) return false;

    return this.doDbOpertions(operations, provider);
  }

  private async getTokenStatsOperation(
    stats: TokenTxsCountMsg,
    provider: any,
  ): Promise<DbOperation> {
    const { token, txs, active_at, create_at } = stats;

    const prevRecord = await this.getPrevRecord(token, provider);
    if (prevRecord) {
      const tokenData: Partial<TokenInfo> = { hash: token, active_at, txs };
      tokenData.txs += +prevRecord.txs || 0;
      if (!prevRecord.create_at) tokenData.create_at = create_at;
      return { record: tokenData, cmd: DB_CMD.update };
    }

    const tokenCreationData = await this.getTokenDataByTokenHash(token);

    if (tokenCreationData) {
      const tokenData: Partial<TokenInfo> = {
        ...tokenCreationData,
        hash: token,
        active_at,
      };
      if (!tokenData.create_at) {
        tokenData.create_at = create_at;
      }
      return { record: tokenCreationData, cmd: DB_CMD.create };
    }
    return { record: { hash: token }, cmd: '' };
  }

  async trackTokensHoldersCountInBatch(
    msgs: TokenHoldersCountMsg[],
  ): Promise<boolean> {
    if (msgs.length === 0) return true;

    const provider = this.pg.getTrxProvider();
    const getOperations = msgs.map(stats =>
      this.getTokenHoldersOperation(stats, provider),
    );
    const operations: DbOperation[] = await Promise.all(
      getOperations,
    ).catch(e => []);

    if (operations.length === 0) return false;

    return this.doDbOpertions(operations, provider);
  }

  private async getTokenHoldersOperation(
    stats: TokenHoldersCountMsg,
    provider,
  ): Promise<DbOperation> {
    const { token, count } = stats;
    const prevRecord = await this.getPrevRecord(token, provider);

    if (prevRecord) {
      const tokenData: Partial<TokenInfo> = { hash: token, holders: count };
      tokenData.holders += +prevRecord.holders || 0;
      return { record: tokenData, cmd: DB_CMD.update };
    }

    // create token then update token
    this.logInfoMsg(`${token} is not in pg, try creating one.`);

    const tokenCreationData = await this.getTokenDataByTokenHash(token);

    if (tokenCreationData) {
      const tokenData = { ...tokenCreationData, holders: count };
      return { record: tokenData, cmd: DB_CMD.create };
    }
    return { record: { hash: token }, cmd: '' };
  }

  // create new token issued on fusion
  async createTokenByTxHash(txHash: string): Promise<boolean> {
    const token = await this.token
      .getTokenByTxHash(txHash, 'fusion')
      .catch(e => {
        this.logError({ method: 'createTokenByTxHash', e });
        return null;
      });

    // no data, ack message directly
    if (!token) {
      return true;
    }

    const provider = this.pg.getTrxProvider();
    const trx = await provider();

    // in db, ack message directly
    const prevRecord = await this.pg.checkExistence(token.hash, provider);
    let result: boolean;
    if (prevRecord) {
      result = await this.pg.updateToken(token, provider);
    } else {
      result = await this.pg.createToken(token, provider);
    }

    if (result) {
      trx.commit();
      this.cacheTokenStatsToRedis(token);
    } else {
      trx.rollback();
    }
    return result;
  }

  // create Erc20 token from tx worker
  async createErc20Token(data: TokenErc20Msg): Promise<boolean> {
    const { tx, timestamp } = data;
    const token: Partial<TokenInfo> = await this.token.getTokenByTxHash(
      tx,
      'erc20',
    );

    if (!token) return true;

    token.create_at = timestamp;
    token.issue_tx = data.tx;

    const provider = this.pg.getTrxProvider();
    const trx = await provider();

    const prevRecord = await this.pg.checkExistence(token.hash, provider);
    let result: boolean;
    if (prevRecord) {
      result = await this.pg.updateToken(token, provider);
    } else {
      result = await this.pg.createToken(token, provider);
    }
    if (result) {
      trx.commit();
      this.cacheTokenStatsToRedis(token);
    } else {
      trx.rollback();
    }
    return result;
  }

  // track fusion token quantity change cmd
  async updateTokenSupply(token: string): Promise<boolean> {
    const qty = await this.token.getTokenSupply(token);
    if (qty === -1) return true;

    const provider = this.pg.getTrxProvider();
    const isExist = await this.pg.checkExistence(token, provider);
    let result: boolean;

    if (!isExist) {
      const tokenData = await this.token.getTokenInfoByTokenHash(token);
      if (tokenData) {
        result = await this.pg.createToken(tokenData, provider);
      } else {
        result = true;
      }
    } else {
      result = await this.pg.updateToken({ hash: token, qty }, provider);
    }

    const trx = await provider();
    if (result) trx.commit();
    else trx.rollback();

    return result;
  }

  // when updating token's txs or hodlers, create token if there is none in DB
  private async getTokenDataByTokenHash(
    tokenHash: string,
  ): Promise<Partial<TokenInfo>> {
    return this.token.getTokenInfoByTokenHash(tokenHash);
  }

  // cache token stats information
  // if data continue growing, extract cache to a single service
  private async cacheTokenStatsToRedis(tokenData: Partial<TokenInfo>) {
    const { txs, active_at, create_at, holders, hash } = tokenData;
    const stats: Partial<Tokenstats> = {};
    if (txs) stats.txs = txs;
    if (active_at) stats.active_at = active_at;
    if (create_at) stats.create_at = create_at;
    if (holders) stats.holders = holders;
    const key = this.getTokenStatsKey(hash);
    const prevStats: Partial<Tokenstats> = await this.getTokenStatsFromRedisCache(
      hash,
    );
    const newStats = { ...prevStats, ...stats };
    this.redis.cacheValue(key, JSON.stringify(newStats));
  }

  private getTokenStatsFromRedisCache(
    token: string,
  ): Promise<Partial<Tokenstats>> {
    const key = this.getTokenStatsKey(token);
    return this.redis.getCachedValue(key).then(val => JSON.parse(val));
  }

  private getTokenStatsKey(token: string): string {
    return `token:${token}:stats`;
  }

  // get token stats information
  private async getPrevRecord(
    token: string,
    provider,
  ): Promise<Partial<TokenInfo>> {
    const tokenInCache = await this.getTokenStatsFromRedisCache(token);
    if (tokenInCache) return tokenInCache;
    return this.pg.checkExistence(token, provider);
  }

  private async doDbOpertions(
    operations: DbOperation[],
    provider,
  ): Promise<boolean> {
    if (operations.length === 0) return true;

    const trx = await provider();
    const doOperations = operations.map(operation => {
      const { record, cmd } = operation;
      if (cmd === DB_CMD.create) return this.pg.createToken(record, provider);
      if (cmd === DB_CMD.update) return this.pg.updateToken(record, provider);
      return Promise.resolve(true);
    });

    const done = await Promise.all(doOperations)
      .then(results => !new Set(results).has(false))
      .catch(e => false);
    if (done) {
      operations.map(operation => {
        const { record, cmd } = operation;
        if (cmd) {
          this.cacheTokenStatsToRedis(record);
        }
      });
      trx.commit();
    } else {
      trx.rollback();
    }
    return done;
  }
}
