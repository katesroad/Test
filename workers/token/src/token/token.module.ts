import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { RpcModule } from './rpc';
import { Erc20Module } from './erc20';

@Module({
  imports: [RpcModule, Erc20Module],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
