import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { RedisHelperService } from './redis-helper.service';

@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('redis'),
    }),
  ],
  providers: [RedisHelperService],
  exports: [RedisHelperService],
})
export class RedisHelperModule {}
