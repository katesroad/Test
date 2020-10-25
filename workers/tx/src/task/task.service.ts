import { Injectable } from '@nestjs/common';
import { TxsStatsService } from './txs-stats.service';

@Injectable()
export class TaskService {
  constructor(private stats: TxsStatsService) {}

  statsTxs() {
    this.stats.trackTxsStats();
  }

  getTxsStatsPrevTrackAt() {
    return this.stats.getTxsStatsPrevTrackAt();
  }

  statsIsUpToDate() {
    return this.stats.isUpToDate();
  }
}
