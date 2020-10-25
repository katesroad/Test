import { Injectable } from '@nestjs/common';
import { RedisHelperService } from './redis-helper';
import { CustomLogger } from '../common';

@Injectable()
export class HelperService extends CustomLogger {
  constructor(private redis: RedisHelperService) {
    super('RedisHelperService');
  }

  updateNetworkState(blockData: {
    timestamp: number;
    number: number;
    txs: number;
  }): void {
    const { timestamp, number, txs } = blockData;
    this.setNetworkHeight(number);
    this.setNetworkTimestamp(timestamp);
    this.setNetworkState({
      height: +number,
      txs: +txs,
      timestamp: +timestamp,
    });
  }

  getNetworkHeight(): Promise<number> {
    return this.redis
      .getCachedValue('network:height')
      .then(val => +val)
      .catch(() => this.getNetworkHeight());
  }

  getNetworkTimestamp(): Promise<number> {
    return this.redis
      .getCachedValue('network:timestamp')
      .then(val => +val)
      .catch(() => this.getNetworkTimestamp());
  }

  getNetworkState(): Promise<any> {
    return this.redis
      .getCachedValue('network')
      .then(val => JSON.parse(val))
      .then(data => JSON.parse(data))
      .catch(e => ({}));
  }

  private setNetworkState(state) {
    this.redis.cacheValue('network', JSON.stringify(state));
  }

  private setNetworkHeight(height: number): void {
    this.redis.cacheValue('network:height', height);
  }

  private setNetworkTimestamp(timestamp: number): void {
    this.redis.cacheValue('network:timestamp', timestamp);
  }

  async sleep(ms: number): Promise<void> {
    return new Promise(resolve => {
      let t1 = setTimeout(() => {
        clearTimeout(t1);
        t1 = null;
        resolve();
      }, ms);
    });
  }
}
