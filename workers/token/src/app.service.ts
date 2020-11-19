import { Injectable } from '@nestjs/common';
import {
  TokenStats,
  DB_CMD,
  HoldersChangeMsg,
  TokenHoldersMsg,
  TokenStatsData,
  DbStatsOperation,
  TonkenStatsMsg,
} from './models';
import { TokenService } from './token';
import { HelperService, RedisHelperService } from './common';
import { PgTokenStatsService, PgTokensService, PgService } from './pg';

@Injectable()
export class AppService {
  constructor(
    private readonly pgStats: PgTokenStatsService,
    private readonly pgToken: PgTokensService,
    private readonly pg: PgService,
    private readonly token: TokenService,
    private readonly redis: RedisHelperService,
    private readonly helper: HelperService,
  ) {}

  /**
   * Update token transaction's stats, active time in batch
   * @param msgs: TokenStatsMsg[]
   * @returns boolean
   */
  async trackTokenTxsStatsInBatch(
    msgs: Partial<TonkenStatsMsg>[],
  ): Promise<boolean> {
    if (msgs.length === 0) return true;

    const provider = this.pg.getTrxProvider();
    const operations = await Promise.all(
      msgs.map(msg => this.getTokenTxsStatsOperation(msg, provider)),
    );
    return this.doTokenStatsOpertions(operations, provider);
  }

  /**
   * Get record operation way
   * @param stats: TokenStatsCountMsg
   * @returns {record: Partial<TokenInfo>, cmd: string};
   */
  private async getTokenTxsStatsOperation(
    statsMsg: Partial<TonkenStatsMsg>,
    provider: any,
  ): Promise<DbStatsOperation> {
    const { token, ...stats } = statsMsg;

    const prevRecord = await this.getTokenPrevStats(token, provider);
    if (!prevRecord) {
      return { cmd: DB_CMD.create, record: { token, ...stats } };
    }

    const record: Partial<TokenStats> = { token, ...prevRecord };
    Object.keys(stats).map(field => {
      if (stats[field]) {
        record[field] = (prevRecord[field] || 0) + stats[field];
      }
    });
    if (stats.active_at) record.active_at = stats.active_at;
    else delete stats.active_at;
    return { cmd: DB_CMD.update, record };
  }

  /**
   * Update token holder's count in batch
   * @param msgs: TokenHoldersMsg[]
   * @returns boolean
   */
  async trackHoldersInBatch(msgs: TokenHoldersMsg[]): Promise<boolean> {
    if (msgs.length === 0) return true;

    const provider = this.pg.getTrxProvider();
    const operations = await Promise.all(
      msgs.map(msg => this.getTokenHolderOpertion(msg, provider)),
    ).catch(e => {
      this.helper.logError({
        method: 'trackHoldersInBatch',
        e,
        data: msgs,
      });
      return [];
    });

    if (operations.length === 0) return false;

    return this.doTokenStatsOpertions(operations, provider);
  }

  /**
   * Get the operation way for a single token
   * @param: msg TokenHoldersMsg
   * @returns operation: DbStatsOperation
   */
  private async getTokenHolderOpertion(
    msg: TokenHoldersMsg,
    provider: any,
  ): Promise<DbStatsOperation> {
    const { token, holders } = msg;

    const noOperation = { cmd: DB_CMD.nil, record: null };
    if (!this.token.isValidTokenHash(token)) return noOperation;

    const isExist = await this.getTokenPrevStats(token, provider);
    if (isExist) {
      return { cmd: DB_CMD.update, record: { token, holders } };
    }
    return { cmd: DB_CMD.create, record: { token, holders } };
  }

  /**
   * Update token holders count based on change quantity in batch
   * @param msgs: HoldersChangeMsg[]
   * @returns boolean
   */
  async trackHoldersChangeInBatch(msgs: HoldersChangeMsg[]): Promise<boolean> {
    if (msgs.length === 0) return true;

    const provider = this.pg.getTrxProvider();
    const operations = await Promise.all(
      msgs.map(msg => this.getHoldersChangeOperation(msg, provider)),
    ).catch(e => {
      this.helper.logError({
        method: 'trackHoldersChangeInBatch',
        e,
        data: msgs,
      });
      return [];
    });
    if (operations.length === 0) return false;

    return this.doTokenStatsOpertions(operations, provider);
  }

  /**
   * Update token holders count based on change quantity
   * @param msg: HoldersChangeMsg
   * @returns boolean
   */
  private async getHoldersChangeOperation(
    msg: HoldersChangeMsg,
    provider: any,
  ): Promise<DbStatsOperation> {
    const { token, change } = msg;

    const noOperation = { cmd: DB_CMD.nil, record: null };
    if (change === 0 || !this.token.isValidTokenHash(token)) {
      return noOperation;
    }

    const prevRecord = await this.getTokenPrevStats(token, provider);
    if (prevRecord) {
      const holders = change + prevRecord.holders;
      const record = { holders, token };
      return { cmd: DB_CMD.update, record };
    }

    return { cmd: DB_CMD.create, record: { token, holders: change } };
  }

  /**
   * Update token supply quantity
   * @param tokenHash:string
   * @returns boolean
   */
  async updateTokenSupply(tokenHash: string): Promise<boolean> {
    const qty = await this.token.getTokenSupply(tokenHash);

    if (qty === undefined) return true;

    const provider = this.pg.getTrxProvider();
    const isExist = await this.pgToken.checkTokenRecord(tokenHash, provider);
    let res: boolean;

    if (!isExist) {
      const tokenData = await this.token.getTokenInfo(tokenHash);
      if (tokenData)
        res = await this.pgToken.createTokenRecord(tokenData, provider);
      else res = true;
    } else {
      res = await this.pgToken.updateTokenRecord(
        { hash: tokenHash, qty },
        provider,
      );
    }

    const trx = await provider();
    if (res) trx.commit();
    else trx.rollback();

    return res;
  }

  /**
   * Create or update a token record in PostgreSQL DB
   * @param operations: DbOperations[], provider: knex transaction providedr
   * @returns boolean
   */
  private async doTokenStatsOpertions(
    operations: DbStatsOperation[],
    provider: any,
  ): Promise<boolean> {
    if (operations.length === 0) return true;

    const trx = await provider();
    const doOperations = operations.map(operation => {
      const { record, cmd } = operation;
      if (cmd === DB_CMD.create)
        return this.pgStats.createStatsRecord(record, provider);
      if (cmd === DB_CMD.update)
        return this.pgStats.updateStatsRecord(record, provider);
      return Promise.resolve(true);
    });

    const res = await Promise.all(doOperations)
      .then(results => !new Set(results).has(false))
      .catch(e => false);
    if (res) {
      operations.map(operation => {
        const { record, cmd } = operation;
        if (cmd) {
          const { token, ...stats } = record;
          this.setTokenStatsToCahe(token, stats);
        }
      });
      trx.commit();
    } else {
      trx.rollback();
    }
    return res;
  }

  /**
   * Get token previous stats data
   * @param tokenHash string
   * @param provider Knex transaction provider
   * @returns Partial<TokenStatsData>
   */
  private async getTokenPrevStats(
    tokenHash: string,
    provider: any,
  ): Promise<Partial<TokenStatsData>> {
    const stats = await this.getTokenStatsFromCache(tokenHash);
    if (stats) return stats;
    return this.pgStats.checkStatsRecord(tokenHash, provider);
  }

  /**
   * Save token stats to redis
   * @param tokenHash:string token's hash string
   * @param stats: Partial<TokenStatsData>
   */
  private async setTokenStatsToCahe(
    tokenHash: string,
    stats: Partial<TokenStatsData>,
  ): Promise<void> {
    const key = this.getTokenStatsKey(tokenHash);
    const prevStats = await this.getTokenStatsFromCache(key);
    const newStats = { ...prevStats, ...stats };
    this.redis.cacheValue(key, JSON.stringify(newStats));
  }

  /**
   * Get token stats data from Redis
   * @param tokenHash:string
   */
  private async getTokenStatsFromCache(
    tokenHash: string,
  ): Promise<Partial<TokenStatsData> | null> {
    const key = this.getTokenStatsKey(tokenHash);
    const stats = await this.redis
      .getCachedValue(key)
      .then(stats => JSON.parse(stats));
    if (!stats) return null;
    const tokenStats: Partial<TokenStatsData> = {};
    const fields = [
      'pair_swap',
      'pair_add',
      'pair_rm',
      'txs',
      'transfers',
      'holders',
    ];
    fields.map(field => {
      tokenStats[field] = +stats[field] || 0;
    });
    return tokenStats;
  }

  private getTokenStatsKey(token: string): string {
    return `token:${token}:stats`;
  }
}
