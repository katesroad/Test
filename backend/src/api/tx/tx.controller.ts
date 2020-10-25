import {
  Controller,
  Get,
  Param,
  CacheTTL,
  Logger,
  Query,
  UsePipes,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { TxService } from './tx.service';
import { HashPipe, QueryCmdDto, QueryCmdPipe } from '../../common';

@Controller('txs?')
@UseInterceptors(CacheInterceptor)
export class TxController {
  private logger = new Logger('TxController');

  constructor(private readonly service: TxService) {}

  @Get()
  @UsePipes(QueryCmdPipe)
  getTxs(@Query() query: QueryCmdDto) {
    return this.service.getTxs(query);
  }

  @Get(':hash')
  @CacheTTL(3600)
  getTxByHash(@Param('hash', new HashPipe('transaction')) hash: string) {
    this.logger.log(`get:${hash}`);
    return this.service.getTxByHash(hash);
  }

  @Get(':hash/detail')
  @CacheTTL(3600)
  getTxDetailByHash(@Param('hash', new HashPipe('transaction')) hash: string) {
    this.logger.log(`get:${hash}`);
    return this.service.getTxDetailByHash(hash);
  }
}
