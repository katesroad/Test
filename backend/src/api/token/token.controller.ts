import {
  Controller,
  Get,
  Query,
  Param,
  UsePipes,
  CacheTTL,
  UseInterceptors,
  CacheInterceptor,
} from '@nestjs/common';
import { TokenService } from './token.service';
import {
  HashPipe,
  QueryCmdPipe,
  QueryCmdDto,
  QueryTokensCmdDto,
  QueryTokensCmdPipe,
} from '../../common';
import { ITxs } from '../../models';

@Controller('tokens?')
@UseInterceptors(CacheInterceptor)
export class TokenController {
  constructor(private readonly service: TokenService) {}

  @Get()
  @UsePipes(QueryTokensCmdPipe)
  getTokens(@Query() query: QueryTokensCmdDto) {
    return this.service.getTokens(query);
  }

  @Get(':hash')
  @UsePipes(new HashPipe('token'))
  getToken(@Param('hash') hash: string) {
    return this.service.getTokenByTokenHash(hash);
  }

  @Get(':hash/holders')
  @CacheTTL(4)
  @UsePipes(new HashPipe('token'))
  @UsePipes(QueryCmdPipe)
  getTokenHolders(@Param('hash') hash: string, @Query() query: QueryCmdDto) {
    return this.service.getTokenHolders(hash, query);
  }

  @Get(':hash/txs')
  @UsePipes(new HashPipe('token'))
  @UsePipes(QueryCmdPipe)
  getTokenTransactions(
    @Param('hash') hash: string,
    @Query() query: QueryCmdDto,
  ): Promise<ITxs> {
    return this.service.getTokenTxs(hash, query);
  }
}
