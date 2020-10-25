import { Module, Global, HttpModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';
import { RedisHelperService } from './redis-helper.service';
import { HelperService } from './helper.service';
import { RpcHelperService } from './rpc-helper.service';

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('redis'),
    }),
    HttpModule.register({}),
  ],
  providers: [RedisHelperService, HelperService, RpcHelperService],
  exports: [RedisHelperService, HelperService],
})
export class HelperModule {}
