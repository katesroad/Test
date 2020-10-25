import {
  Controller,
  Get,
  Query,
  UsePipes,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { QueryCmdDto, QueryCmdPipe } from '../../common';
import { AnyswapService } from './anyswap.service';

@Controller('anyswap')
@UseInterceptors(CacheInterceptor)
export class AnyswapController {
  constructor(private service: AnyswapService) {}

  @Get('txs?')
  @UsePipes(QueryCmdPipe)
  getTxs(@Query() query: QueryCmdDto) {
    return this.service.getTxs(query);
  }
}
