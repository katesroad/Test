import { Injectable } from '@nestjs/common';
import { TokensHoldersQueryDto, QueryCmdDto } from '../../common';
import { PgTokenService, PgTxsService } from '../../shared';
import { ITxs } from '../../models';

@Injectable()
export class TokenService {
  constructor(
    private pgToken: PgTokenService,
    private tx: PgTxsService,
    private token: PgTokenService,
  ) {}

  getTokenByTokenHash(hash: string): Promise<any> {
    return this.pgToken.getToken(hash);
  }

  getTokens(query: QueryCmdDto): Promise<any[]> {
    return this.pgToken.getTokens(query);
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
}
