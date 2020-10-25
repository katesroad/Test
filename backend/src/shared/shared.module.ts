import { Module } from '@nestjs/common';
import { HelperModule } from './helper';
import { PgModule } from './pg';
import { MongoModule } from './mongo';
import { RedisCacheModule } from './redis-cache/redis-cache.module';

@Module({
  imports: [HelperModule, PgModule, MongoModule, RedisCacheModule],
})
export class SharedModule {}
