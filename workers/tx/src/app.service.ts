import { Injectable } from '@nestjs/common';
import { HelperService } from './helper';
import { TaskService } from './task';

@Injectable()
export class AppService {
  constructor(private task: TaskService, private helper: HelperService) {}

  async makeNetworkTxsStats(blockData: {
    timestamp: number;
    number: number;
    transactions: string[];
  }): Promise<void> {
    const { number, timestamp, transactions = [] } = blockData;
    this.helper.updateNetworkState({
      number,
      timestamp,
      txs: transactions.length,
    });

    const prevTrackTxsStatsAt = await this.task.getTxsStatsPrevTrackAt();
    const ONE_DAY = 86400;
    const txsStatsIsUpToDate = this.task.statsIsUpToDate();
    const shouldMakeStats = ONE_DAY + prevTrackTxsStatsAt <= timestamp;
    if (shouldMakeStats && txsStatsIsUpToDate) {
      this.task.statsTxs();
    }
  }
}
