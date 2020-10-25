import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import TxDoc from './transaction.interface';
import { CustomLogger } from '../../common';
import { TokenInfo } from 'src/models';

@Injectable()
export class MongoService extends CustomLogger {
  constructor(
    @InjectModel('Transactions') private readonly model: Model<TxDoc>,
  ) {
    super(`MongoService`);
  }

  getTokenInfoByIssueTxHash(txHash: string): Promise<Partial<TokenInfo>> {
    return this.model
      .findById(txHash, { _id: 0, timestamp: 1, log: 1 })
      .then(doc => {
        if (!doc) return null;
        const { timestamp, log } = doc.toJSON();
        return { issue_tx: txHash, create_at: timestamp, hash: log.AssetID };
      })
      .catch(() => null);
  }

  getTokenInfoByTokenHash(token: string): Promise<Partial<TokenInfo>> {
    return this.model
      .aggregate([
        { $match: { type: 'GenAssetFunc', 'log.AssetID': token } },
        {
          $project: {
            _id: 0,
            issue_tx: '$hash',
            issuer: '$from',
            create_at: '$timestamp',
            log: 1,
          },
        },
        { $limit: 1 },
      ])
      .then(docs => {
        if (!docs.length) return null;

        const { log, ...tx } = docs[0];
        const {
          Symbol,
          Name,
          Decimals,
          CanChange,
          Total,
          AssetID,
          Description,
        } = log;
        const qty = Total / Math.pow(10, Decimals);

        let info = null;

        try {
          const desc = JSON.parse(Description);
          if (Object.keys(desc).length) info = desc;
        } catch {
          info = { desc: Description };
        }

        return {
          ...tx,
          qty,
          symbol: Symbol,
          name: Name,
          precision: Decimals,
          canchange: CanChange,
          hash: AssetID,
          info: JSON.stringify(info),
        };
      })
      .catch(e => {
        this.logError({
          method: 'getTokenInfoByID',
          e,
          data: token,
        });
        return null;
      });
  }
}
