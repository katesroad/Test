import { Injectable } from '@nestjs/common';
import { QueryCmdDto } from '../../common';
import { PgTokenService, PgTxsService, RedisHelperService } from '../../shared';
import { ITxs } from '../../models';

@Injectable()
export class TokenService {
  constructor(
    private pgToken: PgTokenService,
    private tx: PgTxsService,
    private token: PgTokenService,
    private redis: RedisHelperService,
  ) {}

  getTokenByTokenHash(hash: string): Promise<any> {
    return this.pgToken.getToken(hash);
  }

  getTokens(query: QueryCmdDto): Promise<any[]> {
    return this.pgToken.getTokens(query);
  }

  getTokenSnapshots(
    tokenIds: string[],
  ): Promise<{ [key: string]: { symbol: string; precision: number } }> {
    const tokens = tokenIds.filter(function(hash) {
      return hash.length === 42 || hash.length === 66;
    });
    const promises = tokens.map(token => this.getTokenSnapshot(token));
    const map = {};
    return Promise.all(promises)
      .then(snapshotList => {
        snapshotList.map(item => {
          if (item) {
            const { token, ...snapshot } = item;
            map[token] = snapshot;
          }
        });
        return map;
      })
      .catch(e => ({}));
  }

  getTokenHolders(hash: string, query: QueryCmdDto) {
    return this.pgToken.getTokenHolders(hash, query);
  }

  getTokenTxs(hash: string, query: QueryCmdDto): Promise<ITxs> {
    const getTxs = this.tx.getTokensTxs(hash, query);
    const getTxsStats = this.token.getTokenStats(hash);
    return Promise.all([getTxs, getTxsStats]).then(res => {
      const [data, stats] = res;
      return {
        txs: data,
        total: stats.txs,
      };
    });
  }

  // dirty code, workers store the token snapshot in a shared redis instance
  private getTokenSnapshot(
    token: string,
  ): Promise<{ symbol: string; precision: number; token: string }> {
    const redisKey = `token:${token}:snapshot`;
    return this.redis
      .getCachedValue(`token:${token}:snapshot`)
      .then(val => {
        if (val) {
          const snapshot = JSON.parse(val);
          return { ...snapshot, token };
        }
        return this.pgToken
          .getToken(token)
          .then(data => {
            const { symbol, precision } = data;
            this.redis.cacheValue(
              redisKey,
              JSON.stringify({ symbol, precision }),
            );
            return { symbol, precision, token };
          })
          .catch(e => null);
      })
      .catch(e => ({}));
  }
}
