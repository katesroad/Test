import { Module, Global } from '@nestjs/common';
import { RedisHelperService } from './redis-helper.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';

@Global()
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
