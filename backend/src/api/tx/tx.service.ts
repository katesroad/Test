import { Injectable } from '@nestjs/common';
import { QueryCmdDto } from '../../common/pipes';
import { MongoService } from '../../shared/mongo';
import { PgTxsService } from '../../shared';

import { ITxs } from '../../models';

@Injectable()
export class TxService {
  constructor(private mongo: MongoService, private pg: PgTxsService) {}

  async getTxByHash(hash: string) {
    const queryMongo = this.mongo.getTxByHash(hash);
    const queryPg = this.pg.getTxByHash(hash);
    return Promise.all([queryMongo, queryPg]).then(data => {
      const [mongo, pg] = data;
      const tx = {
        ...mongo,
        ...pg,
      };
      if (tx.type === undefined) tx.type = -2;
      if (tx.block === undefined) {
        tx.block = tx.blockNumber;
        delete tx.blockNumber;
      }
      return tx;
    });
  }

  getTxDetailByHash(hash: string) {
    return this.mongo.getTxByHash(hash);
  }

  getTxs(query: QueryCmdDto): Promise<ITxs> {
    return this.pg.getTxs(query);
  }
}
