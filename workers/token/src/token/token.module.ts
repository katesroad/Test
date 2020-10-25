import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { MongoModule } from './mongo/mongo.module';
import { RpcModule } from './rpc/rpc.module';
import { Erc20Module } from './erc20/erc20.module';

@Module({
  imports: [RpcModule, Erc20Module, MongoModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
