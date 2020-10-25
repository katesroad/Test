import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import TxDoc from './transaction.interface';
import { CustomLogger, QueryCmdDto } from '../../common';
import { IPagedBlock } from '../../models';
import BlockDoc from './block.interface';

@Injectable()
export class MongoService extends CustomLogger {
  constructor(
    @InjectModel('Transactions') private tx: Model<TxDoc>,
    @InjectModel('Blocks') private block: Model<BlockDoc>,
  ) {
    super('MongoService');
  }

  getTxByHash(hash: string): Promise<any> {
    this.logInfo({ method: 'getTxByHash', data: { hash } });
    return this.tx.find({ _id: hash }, { _id: 0 }).then(docs => {
      if (docs.length) return docs[0].toJSON();
      throw new BadRequestException(`Cant' find transaction ${hash}.`);
    });
  }

  getBlocksTicketTxs(block: number): Promise<any[]> {
    this.logInfoMsg(`Get ticket txs for block ${block}.`);
    return this.tx
      .find(
        { type: 'BuyTicketFunc', blockNumber: block },
        {
          _id: 0,
          hash: 1,
          status: 1,
          from: 1,
          to: 1,
          timestamp: 1,
          blockNumber: 1,
          gasUsed: 1,
          gasPrice: 1,
        },
      )
      .then(docs => {
        const txs = docs.map(doc => doc.toJSON());
        return txs.map(tx => {
          const {
            from,
            to,
            gasUsed,
            gasPrice,
            blockNumber,
            timestamp,
            ...others
          } = tx;
          const fee = (gasUsed * gasPrice) / Math.pow(10, 18);
          return {
            ...others,
            sender: from,
            receiver: to,
            type: -2,
            fee,
            block: blockNumber,
            data: {},
            age: timestamp,
          };
        });
      })
      .catch(e => []);
  }

  getBlock(number: number): Promise<any> {
    this.logInfoMsg(`Get block ${number}`);
    return this.block.findOne({ number }, { _id: 0 }).then(doc => {
      if (doc) return this.cleanBlock(doc.toJSON());
      throw new BadRequestException(`Can't find block ${number}.`);
    });
  }

  getBlocktime(number: number): Promise<number> {
    return this.block
      .findOne({ number }, { blockTime: 1, _id: 0 })
      .then(doc => {
        if (!doc) return 13;
        return doc.toJSON().blockTime;
      })
      .catch(e => 13);
  }

  async getBlocks(lBk: number, query: QueryCmdDto): Promise<IPagedBlock[]> {
    this.logInfo({ method: 'getBlocks', data: { lBk, query } });
    const { cmd, anchor, size } = query;

    const $match: any = {};
    if (cmd === 'first') {
      $match.number = { $lte: lBk, $gte: lBk - size };
    }
    if (cmd === 'last') {
      $match.number = { $lte: size, $gte: 0 };
    }
    if (cmd === 'next') {
      $match.number = { $lt: anchor, $gte: anchor - size };
    }
    if (cmd === 'prev') {
      $match.number = { $lte: anchor + size, $gt: anchor };
    }

    const $sort = { number: -1 };
    const $project = {
      _id: 0,
      number: 1,
      miner: 1,
      reward: 1,
      timestamp: 1,
      txcount: 1,
    };

    return this.block
      .aggregate([{ $match }, { $project }, { $limit: size }, { $sort }])
      .then(blocks => blocks.map(block => this.cleanBlock(block)));
  }

  private cleanBlock(block: any): any {
    const { reward, txcount, number, ...others } = block;
    return {
      height: number,
      ...others,
      reward: +reward / Math.pow(10, 18),
      txs: txcount,
    };
  }
}
