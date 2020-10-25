import { Injectable } from '@nestjs/common';
import { MongoService } from './mongo/mongo.service';
import { CustomLogger } from './common';
import { WorkerClientService } from './worker-client';
import { RedisHelperService } from './redis-helper';

@Injectable()
export class AppService extends CustomLogger {
  constructor(
    private readonly mongo: MongoService,
    private readonly redis: RedisHelperService,
    private workerClient: WorkerClientService,
  ) {
    super('AppService');
  }

  private async onApplicationBootstrap() {
    await this.sleep(14000);
    this.trackMiners();
  }

  setNetworkHeight(height: number): void {
    const key = this.getNetworkHeightKey();
    this.redis.cacheValue(key, height);
  }

  private async trackMiners() {
    const prevTrackAt = await this.getPrevTrackAt();
    const { miners = [], syncHeight = -1 } = await this.mongo.aggregateMiners(
      prevTrackAt,
    );
    this.workerClient.updateMinersInfo(miners);
    this.setPrevTrackAt(syncHeight);

    const networkHeight = await this.getNetworkHeight();
    if (networkHeight === syncHeight) await this.sleep(13000);

    this.trackMiners();
  }

  private getNetworkHeight(): Promise<number> {
    const key = this.getNetworkHeightKey();
    return this.redis.getCachedValue(key).then(val => +val);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  private getPrevTrackAt(): Promise<number> {
    const key = this.getTrackAtkey();
    return this.redis
      .getCachedValue(key)
      .then(val => {
        if (+val) return +val;
        else return -1;
      })
      .catch(() => -1);
  }

  private setPrevTrackAt(height: number) {
    const redisKey = this.getTrackAtkey();
    this.redis.cacheValue(redisKey, height);
  }

  private getTrackAtkey() {
    return 'track_at';
  }

  private getNetworkHeightKey() {
    return `network:height`;
  }
}
