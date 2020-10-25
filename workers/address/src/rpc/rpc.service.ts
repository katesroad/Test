import { HttpService, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisHelperService } from 'src/redis-helper/redis-helper.service';

@Injectable()
export class RpcService {
  private retried = 0;
  constructor(
    private readonly http: HttpService,
    private config: ConfigService,
    private redis: RedisHelperService,
  ) {}

  // count how many types of tl tokens an address have
  // document: https://github.com/fsn-dev/fsn-rpc-api/blob/master/fsn-rpc-api.md#fsn_getAllTimeLockBalances
  async getAddressTlBalances(address: string): Promise<number> {
    const rpcUrl = this.config.get('rpcUrl');
    const key = `address:${address}:tl_tokens`;
    const tlTokensCount = await this.redis
      .getCachedValue(key)
      .then(val => JSON.parse(val));
    if (tlTokensCount !== null) return tlTokensCount;

    return this.http
      .post(rpcUrl, {
        jsonrpc: '2.0',
        method: 'fsn_getAllTimeLockBalances',
        params: [address, 'latest'],
        id: 1,
      })
      .toPromise()
      .then(res => res.data)
      .then(data => data.result)
      .then(res => {
        this.retried = 0;
        let count: any;
        if (!res) {
          count = null;
        }
        count = Object.keys(res).length;
        this.redis.cacheValue(key, JSON.stringify(count), 13 * 20);
        return count;
      })
      .catch(() => {
        this.retried += 1;
        if (this.retried > 4) {
          this.redis.cacheValue(key, null, 13);
        }
        return this.getAddressTlBalances(address);
      });
  }
}
