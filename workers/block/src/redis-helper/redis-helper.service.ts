import { Injectable } from '@nestjs/common';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class RedisHelperService {
  private redis: any;

  constructor(redisService: RedisService) {
    this.redis = redisService.getClient('block');
  }

  cacheValue(key: string, value: any, expiration?: number): void {
    const redisKey = this.getKey(key);
    if (expiration) {
      this.redis.set(redisKey, JSON.stringify(value), 'EX', expiration);
    } else this.redis.set(redisKey, JSON.stringify(value));
  }

  getCachedValue(key: string): Promise<any> {
    const redisKey = this.getKey(key);
    return this.redis.get(redisKey);
  }

  private getKey(key: string): string {
    return `worker:block:${key}`;
  }
}
