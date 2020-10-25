import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  CacheTTL,
  Query,
  UsePipes,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { BlockService } from './block.service';
import { IBlock, IPagedBlock, ITx } from '../../models';
import { QueryCmdPipe, QueryCmdDto } from '../../common';

@Controller('blocks?')
@UseInterceptors(CacheInterceptor)
export class BlockController {
  constructor(private readonly service: BlockService) {}

  @Get()
  @UsePipes(QueryCmdPipe)
  @CacheTTL(4)
  getBlocks(@Query() query: QueryCmdDto): Promise<IPagedBlock[]> {
    return this.service.getBlocks(query);
  }

  @Get(':height')
  @CacheTTL(3600)
  getBlockByHeight(
    @Param('height', ParseIntPipe) height: number,
  ): Promise<IBlock> {
    return this.service.getBlock(height);
  }

  @Get(':height/txs')
  @CacheTTL(3600)
  getBlocksTxs(@Param('height', ParseIntPipe) height: number): Promise<ITx[]> {
    return this.service.getBlocksTxs(height);
  }
}
