import { Injectable } from '@nestjs/common';
import { QueryCmdDto } from '../../common';
import { PgTxsService } from '../../shared';

@Injectable()
export class AnyswapService {
  constructor(private servie: PgTxsService) {}

  getTxs(query: QueryCmdDto) {
    return this.servie.getTxs(query, true);
  }
}
