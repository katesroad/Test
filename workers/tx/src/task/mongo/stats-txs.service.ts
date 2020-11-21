import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TxsRange, RangeTxsStats } from '../../models';
import TxDoc from './transaction.interface';
import { HelperService } from '../../helper';

@Injectable()
export class StatsTxsService {
  constructor(
    @InjectModel('Transactions') private model: Model<TxDoc>,
    private readonly helper: HelperService,
  ) {}

  async getTxsStatsForRange(range: TxsRange): Promise<RangeTxsStats> {
    this.helper.logInfo({
      method: 'getTxsStatsForRange',
      data: range,
    });
    const lTxTimeInDB = await this.getLTimeForRangeTxs(range);
    const promises: any[] = [
      this.getAllTxsStatsForRange(range),
      this.getTicketTxsStatsForRange(range),
    ];

    return Promise.all(promises)
      .then(data => {
        const [txs, ticketTxs] = data;
        return { txs, ticket_txs: ticketTxs };
      })
      .then(stats => ({ stats_at: lTxTimeInDB, stats }))
      .then(statsData => {
        this.helper.logInfo({
          method: 'getTxsStatsForRange',
          data: statsData,
        });
        return statsData;
      });
  }

  getTxStatsTrackStartTime(): Promise<number> {
    this.helper.logInfoMsg(`Get stats start time from MongoDB.`);
    return this.model
      .aggregate([
        { $project: { timestamp: 1, _id: 0 } },
        { $sort: { timestamp: 1 } },
        { $limit: 1 },
      ])
      .then(records => records[0].timestamp);
  }

  private getAllTxsStatsForRange(range: TxsRange): Promise<number> {
    return this.model
      .aggregate([
        { $match: { timestamp: range } },
        { $project: { _id: 0, timestamp: 1 } },
        { $count: 'total' },
      ])
      .then(records => records[0].total)
      .then(count => {
        this.helper.logInfoMsg(`All txs:${count}`);
        return count;
      });
  }

  private getTicketTxsStatsForRange(range: TxsRange): Promise<number> {
    return this.model
      .aggregate([
        { $match: { timestamp: range, type: 'BuyTicketFunc' } },
        { $project: { timestamp: 1 } },
        { $count: 'total' },
      ])
      .then(records => records[0].total)
      .then(count => {
        this.helper.logInfoMsg(`Ticket txs:${count}`);
        return count;
      });
  }

  private getLTimeForRangeTxs(range: TxsRange): Promise<number> {
    return this.model
      .find({ timestamp: range }, { timestamp: 1 })
      .sort({ timestamp: -1 })
      .limit(1)
      .then(records => {
        if (records.length) return records[0].timestamp;
      })
      .then((timestamp: number) => {
        this.helper.logInfoMsg(`LTimeForRange: ${timestamp} for tx stats`);
        return timestamp;
      });
  }
}
