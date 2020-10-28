import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RawTx, TxsRange, RangeTxsStats } from '../../models';
import { CustomLogger } from '../../common';
import TxDoc from './transaction.interface';

@Injectable()
export class MongoService extends CustomLogger {
  constructor(@InjectModel('Transactions') private model: Model<TxDoc>) {
    super('MongoService');
  }

  async getRawTxsForRange(
    range: TxsRange,
    check?: { height: number; txs: number },
  ): Promise<any> {
    const { $lte, $gt } = range;
    this.logInfoMsg(`Read txs from ${$gt}~${$lte}`);
    if (check && check.txs) {
      while (true) {
        const synced = await this.doSyncCheck(check);
        if (synced) break;
        else await this.sleep(500);
      }
    }
    const startAt = Date.now();
    const promises: Promise<any>[] = [
      this.getRawTxs(range),
      this.getLBkForRangeTxs(range),
    ];
    return Promise.all(promises)
      .then(data => {
        const [rawTxs, syncHeight] = data;
        return { rawTxs, syncHeight };
      })
      .then(data => {
        const cost = Date.now() - startAt;
        this.logInfoMsg(`Cost ${cost} ms, found ${data.rawTxs.length} txs`);
        return data;
      })
      .catch(e => {
        this.logError({ method: 'getRawTxsForRange', e: JSON.stringify(e) });
        return { rawTxs: [], syncHeight: range.$gt };
      });
  }

  private doSyncCheck(check) {
    const { height, txs } = check;
    this.logInfoMsg(`Is checking to MongoDB ${height}...`);
    return this.model
      .aggregate([
        {
          $match: { blockNumber: height },
        },
        { $project: { blockNumber: 1 } },
        {
          $count: 'total',
        },
      ])
      .then(data => {
        if (!data.length) return false;
        return data[0].total === txs;
      });
  }

  getTxTrackStartHeight(): Promise<number> {
    this.logInfoMsg(`Getting the start track height at MongoDB`);

    return this.model
      .aggregate([
        { $match: { type: { $ne: 'BuyTicketFunc' } } },
        { $project: { blockNumber: 1 } },
        { $sort: { blockNumber: 1 } },
        { $limit: 1 },
      ])
      .then(records => {
        let startAt: number;
        if (records.length) {
          startAt = records[0].blockNumber - 1;
        } else {
          startAt = -1;
        }
        this.logInfoMsg(`Track height fom mongo: ${startAt}`);
        return startAt;
      });
  }

  async getTxsStatsForRange(range: TxsRange): Promise<RangeTxsStats> {
    this.logInfo({
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
        this.logInfo({
          method: 'getTxsStatsForRange',
          data: statsData,
        });
        return statsData;
      });
  }

  getTxStatsTrackStartTime(): Promise<number> {
    this.logInfoMsg(`Get stats start time from MongoDB.`);
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
        this.logInfoMsg(`All txs:${count}`);
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
        this.logInfoMsg(`Ticket txs:${count}`);
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
        this.logInfoMsg(`LTimeForRange: ${timestamp} for tx stats`);
        return timestamp;
      });
  }

  private getLBkForRangeTxs(txsRange: TxsRange): Promise<number> {
    const { $lte } = txsRange;
    return this.model
      .find({ blockNumber: { $lte } }, { blockNumber: 1 })
      .sort({ blockNumber: -1 })
      .limit(1)
      .then(records => {
        if (records.length) return records[0].blockNumber;
        return txsRange.$gt;
      });
  }

  private async getRawTxs(range: TxsRange): Promise<RawTx[]> {
    const { $lte, $gt } = range;

    const $limit = $lte - $gt;
    if ($limit == 0) return [];

    const startAt = Date.now();
    return this.model
      .aggregate([
        { $match: { type: { $ne: 'BuyTicketFunc' }, blockNumber: range } },
        {
          $project: {
            _id: 0,
            hash: 1,
            type: 1,
            gasPrice: 1,
            gasUsed: 1,
            status: 1,
            from: 1,
            to: 1,
            timestamp: 1,
            log: 1,
            ivalue: 1,
            dvalue: 1,
            erc20Receipts: 1,
            exchangeReceipts: 1,
            block: '$blockNumber',
          },
        },
      ])
      .then((txs: RawTx[]) => {
        const rangeStr = `${$gt}~${$lte}`;
        const cost = Date.now() - startAt;
        this.logInfoMsg(
          `MongoDB:Range: ${rangeStr}.Cost:${cost} ms, Found ${txs.length} txs.`,
        );
        return txs;
      })
      .catch((e: any) => {
        this.logError({ method: 'getRawTxs', e: JSON.stringify(e) });
        process.exit();
      });
  }

  private sleep(ms) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(null);
      }, ms);
    });
  }
}
