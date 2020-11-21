import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RawTx, TxsRange } from '../../models';
import TxDoc from './transaction.interface';
import { HelperService } from '../../helper';

@Injectable()
export class ReadTxsService {
  constructor(
    @InjectModel('Transactions') private model: Model<TxDoc>,
    private readonly helper: HelperService,
  ) {}

  async getRawTxsForRange(
    range: TxsRange,
    check?: { height: number; txs: number },
  ): Promise<any> {
    const { $lte, $gt } = range;
    this.helper.logInfoMsg(`Read txs from ${$gt}~${$lte}`);
    if (check && check.txs) {
      while (true) {
        const synced = await this.doSyncCheck(check);
        if (synced) break;
        else await this.helper.sleep(500);
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
        this.helper.logInfoMsg(
          `Cost ${cost} ms, found ${data.rawTxs.length} txs`,
        );
        return data;
      })
      .catch(e => {
        this.helper.logError({
          method: 'getRawTxsForRange',
          e: JSON.stringify(e),
        });
        return { rawTxs: [], syncHeight: range.$gt };
      });
  }

  getTxTrackStartHeight(): Promise<number> {
    this.helper.logInfoMsg(`Getting the start track height at MongoDB`);

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
        this.helper.logInfoMsg(`Track height fom mongo: ${startAt}`);
        return startAt;
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
        this.helper.logInfoMsg(
          `MongoDB:Range: ${rangeStr}.Cost:${cost} ms, Found ${txs.length} txs.`,
        );
        return txs;
      })
      .catch((e: any) => {
        this.helper.logError({ method: 'getRawTxs', e: JSON.stringify(e) });
        process.exit();
      });
  }

  private doSyncCheck(check): Promise<boolean> {
    const { height, txs } = check;
    this.helper.logInfoMsg(`Is checking to MongoDB ${height}...`);
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
}