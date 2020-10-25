import { Injectable, BadRequestException } from '@nestjs/common';
import { IBlock, IPagedBlock } from '../../models';
import { MongoService } from '../../shared/mongo';
import { PgTxsService, HelperService } from '../../shared';
import { CustomLogger, QueryCmdDto } from '../../common';

@Injectable()
export class BlockService extends CustomLogger {
  constructor(
    private readonly mongo: MongoService,
    private pg: PgTxsService,
    private helper: HelperService,
  ) {
    super('BlockService');
  }

  async getBlocks(query: QueryCmdDto): Promise<IPagedBlock[]> {
    this.logInfo({ method: 'getBlocks', data: query });
    const lBk = await this.helper.getNetworkHeight();
    return this.mongo.getBlocks(lBk, query);
  }

  async getBlock(height: number): Promise<IBlock> {
    await this.checkBlockNumber(height);
    return this.mongo.getBlock(height);
  }

  async getBlocksTxs(height: number): Promise<any[]> {
    await this.checkBlockNumber(height);

    this.logInfo({ method: 'getBlocksTxs', data: { height } });

    const getNoneTicketTxs = this.pg.getBlocksTxs(height);
    const getTicketTxs = this.mongo.getBlocksTicketTxs(height);
    return Promise.all([getNoneTicketTxs, getTicketTxs]).then(data => {
      const [txs = [], txs2 = []] = data;
      return [...txs, ...txs2];
    });
  }

  private async checkBlockNumber(height: number): Promise<void> {
    const isInvalid = isNaN(height) || height < 0;
    if (isInvalid) {
      throw new BadRequestException(`Block number ${height} is invalid.`);
    }

    const networkHeight = await this.helper.getNetworkHeight();
    if (height > networkHeight) {
      throw new BadRequestException(
        `Network has not reached height:${height} yet.`,
      );
    }
  }
}
