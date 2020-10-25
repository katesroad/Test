import { Module, Global } from '@nestjs/common';
import { RedisHelperService } from './redis-helper.service';
import { RedisModule } from 'nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('redis'),
    }),
  ],
  exports: [RedisHelperService],
  providers: [RedisHelperService],
})
export class RedisHelperModule {}
