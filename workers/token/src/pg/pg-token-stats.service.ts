import { Injectable } from '@nestjs/common';
import { HelperService } from 'src/common';
import { TokenStats } from '../models';

@Injectable()
export class PgTokenStatsService {
  private table = 'token_stats';

  constructor(private readonly helper: HelperService) {}

  /**
   * Check if a record is in PostgreSQL DB
   * @param tokenHash:string
   * @returns TokenStats
   */
  async checkStatsRecord(
    token: string,
    provider: any,
  ): Promise<TokenStats | null> {
    const trx = await provider();

    const select = [
      'holders',
      'txs',
      'transfers',
      'pair_add',
      'pair_rm',
      'pair_swap',
    ];

    return trx
      .where({ token })
      .select(...select)
      .from(this.table)
      .limit(1)
      .first()
      .then(record => {
        if (!record) return null;
        Object.keys(record).map(field => {
          record[field] = +record[field];
        });
        return record;
      })
      .catch(e => {
        this.helper.logError({ method: 'checkExistence', data: token, e });
        return null;
      });
  }

  /**
   * Create a token stats record in PostgreSQL db
   * @params token: tokenInfo, provider:Knex transaction provider
   * @returns boolean
   */
  async createStatsRecord(
    tokenStats: Partial<TokenStats>,
    provider: any,
  ): Promise<boolean> {
    const trx = await provider();
    const { token } = tokenStats;
    return trx
      .insert(tokenStats)
      .into(this.table)
      .then(() => {
        this.helper.logInfoMsg(`Created token stats:${token}!`);
        return true;
      })
      .catch(e => {
        this.helper.logError({ method: 'createStatsRecord', data: token, e });
        return false;
      });
  }

  /**
   * Update token stats data
   * @param token: PartialTokenInfo>
   * @param provider: PostgreSQL transaction provider by Knex
   * @returns boolean. true: update is sucessful, false; update is failed
   */
  async updateStatsRecord(
    tokenData: Partial<TokenStats>,
    provider: any,
  ): Promise<boolean> {
    const { token, ...update } = tokenData;
    if (Object.keys(update).length === 0) return true;

    const trx = await provider();
    return trx
      .update(update)
      .from(this.table)
      .where({ token })
      .catch((e: any) => {
        this.helper.logError({ method: 'updateStatsRecord', e, data: token });
        return false;
      });
  }
}
