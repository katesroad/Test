import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BlockDoc from './block.interface';
import { CustomLogger } from 'src/common';

@Injectable()
export class MongoService extends CustomLogger {
  constructor(@InjectModel('Blocks') private readonly model: Model<BlockDoc>) {
    super('MongoService');
  }

  async aggregateMiners(
    prevTrackAt: number,
  ): Promise<{ syncHeight: number; miners: string[] }> {
    this.logInfoMsg(`Aggregate miners. Prev track at: ${prevTrackAt}`);

    let syncHeight = prevTrackAt;
    const miners = await this.model
      .aggregate([
        { $match: { number: { $gt: prevTrackAt } } },
        {
          $group: {
            _id: '$miner',
            latest: { $max: '$number' },
          },
        },
      ])
      .then(stats =>
        stats.map(({ _id, latest }) => {
          syncHeight = Math.max(latest, syncHeight);
          return _id;
        }),
      )
      .catch(e => {
        this.logError({
          method: 'aggregateMiners',
          e,
        });
        return [];
      });
    this.logInfoMsg(`Found ${miners.length} miners this time.`);
    this.logInfoMsg(`SyncHeight: ${syncHeight}`);
    return { syncHeight, miners };
  }
}
