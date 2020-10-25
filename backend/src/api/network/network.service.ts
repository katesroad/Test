import { Injectable } from '@nestjs/common';
import { INetworkSummary } from '../../models';
import { HelperService, PgTxsService } from '../../shared';
import { MongoService } from '../../shared';

@Injectable()
export class NetworkService {
  constructor(
    private service: HelperService,
    private pg: PgTxsService,
    private mongo: MongoService,
  ) {}

  async getNetworkSummary(): Promise<INetworkSummary> {
    return this.service.getNetworkSummary();
  }

  async getLBKsTxs(): Promise<{ txs: any[]; bks: any[] }> {
    const query = { cmd: 'first', size: 6 };
    const lBk = await this.service.getNetworkHeight();
    const getL6Bks = this.mongo.getBlocks(lBk, query);
    const getL6Txs = this.pg.getTxs(query);
    return Promise.all([getL6Bks, getL6Txs])
      .then(data => {
        const [bks, txsData] = data;
        return { bks, txs: txsData.txs };
      })
      .catch(e => ({ txs: [], bks: [] }));
  }
}
