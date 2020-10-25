import { Injectable } from '@nestjs/common';
import { PgStatsService } from '../../shared';
import { TxsStatsQueryDto, TxsStats } from '../../models';

@Injectable()
export class StatsService {
  constructor(private tx: PgStatsService) {}

  getTxsStats(query: TxsStatsQueryDto): Promise<TxsStats[]> {
    return this.tx.getTxsStats(query);
  }
}
