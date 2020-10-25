import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class RedisHelperService {
  private redis: any;

  constructor(redisService: RedisService) {
    this.redis = redisService.getClient('address');
  }

  flushPatternKeys(pattern: string) {
    this.redis.keys(`${pattern}:*`).then(function(keys: string[]) {
      const pipeline = this.redis.pipeline();
      keys.map(key => pipeline.del(key));
      return pipeline.exec();
    });
  }

  cacheValue(key: string, value: string, expiration?: number): void {
    const redisKey = this.getKey(key);
    if (expiration) this.redis.set(redisKey, value, 'EX', expiration);
    else this.redis.set(redisKey, value);
  }

  getCachedValue(key: string): Promise<string> {
    const redisKey = this.getKey(key);
    return this.redis.get(redisKey);
  }

  private getKey(key: string): string {
    return `worker:address:${key}`;
  }
}
