import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { CustomLogger } from '../../common';
import { TxsStats, TxsStatsQueryDto } from '../../models';

@Injectable()
export class PgStatsService extends CustomLogger {
  constructor(@InjectKnex() private knex: Knex) {
    super('PgStatsService');
  }

  getTxsStats(range: TxsStatsQueryDto): Promise<TxsStats[]> {
    this.logInfo({ method: 'getTxsStats', data: range });

    const { from, to } = range;
    return this.knex('txs_stats')
      .where(function() {
        return this.where('stats_at', '>', from).andWhere('stats_at', '<', to);
      })
      .select('stats', 'stats_at')
      .then(records =>
        records.map(record => {
          return { ...record, stats: JSON.parse(record.stats) };
        }),
      );
  }
}
