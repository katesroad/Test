import { Global, HttpModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';
import { HelperService } from './helper.service';
import { NetworkService } from './network.service';
import { RedisHelperService } from './redis-helper.service';
import { RpcHelperService } from './rpc-helper.service';

@Global()
@Module({
  imports: [
    HttpModule.register({}),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('redis'),
    }),
  ],
  providers: [
    HelperService,
    NetworkService,
    RedisHelperService,
    RpcHelperService,
  ],
  exports: [
    HelperService,
    NetworkService,
    RpcHelperService,
    RedisHelperService,
  ],
})
export class HelperModule {}
