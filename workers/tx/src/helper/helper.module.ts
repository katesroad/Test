import { Global, Module } from '@nestjs/common';
import { RedisHelperModule } from './redis-helper';
import { RpcHelperModule } from './rpc-helper';
import { HelperService } from './helper.service';

@Global()
@Module({
  imports: [RedisHelperModule, RpcHelperModule],
  providers: [HelperService],
  exports: [HelperService, RedisHelperModule, RpcHelperModule],
})
export class HelperModule {}
