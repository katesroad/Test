import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { RangeTxsStats } from '../../models';
import { HelperService } from '../../helper';

@Injectable()
export class PgTxsStatsService {
  constructor(
    @InjectKnex() private knex: Knex,
    private readonly helper: HelperService,
  ) {}

  getTrxProvider(): any {
    return this.knex.transactionProvider();
  }

  getTxStatsTrackStartTime(): Promise<number> {
    this.helper.logInfoMsg(`Getting txs stats start time from pg.`);
    return this.knex('txs_stats')
      .select('stats_at')
      .orderBy('stats_at', 'desc')
      .limit(1)
      .first()
      .then((record: { stats_at: number }) => {
        if (record) return record.stats_at;
      });
  }

  async saveTxsStats(statsData: RangeTxsStats): Promise<boolean> {
    const { stats_at, stats } = statsData;
    const startAt = Date.now();
    return this.knex(`txs_stats`)
      .insert({ stats_at, stats: JSON.stringify(stats) })
      .then(() => {
        const cost = Date.now() - startAt;
        this.helper.logInfoMsg(`Saved txs stats, cost ${cost} ms`);
        return true;
      })
      .catch(e => {
        this.helper.logError({ method: `saveTxsStats`, e, data: statsData });
        return false;
      });
  }
}
