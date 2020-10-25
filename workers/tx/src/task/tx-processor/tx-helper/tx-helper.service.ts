import { Injectable } from '@nestjs/common';
import { Web3Service } from './web3';
import { FusionTokenService } from './fusion-token.service';
import { RedisHelperService } from '../../../helper';
import { TokenSnapshot } from '../../../models';
import { FSN_TOKEN } from '../../../common';

@Injectable()
export class TxHelperService {
  constructor(
    private redis: RedisHelperService,
    private fusion: FusionTokenService,
    private erc20: Web3Service,
  ) {}

  async getTokenSnapshot(token: string): Promise<TokenSnapshot> {
    const tokenHash = token.trim();
    if (tokenHash === FSN_TOKEN) return { symbol: 'FSN', precision: 18 };
    const key = `token:${tokenHash}:snapshot`;

    let snapshot: TokenSnapshot | null = await this.redis
      .getCachedValue(key)
      .then(val => JSON.parse(val));

    if (snapshot) return snapshot;

    if (tokenHash.length == 42) {
      snapshot = await this.erc20.getTokenSnapshot(tokenHash);
    } else {
      snapshot = await this.fusion.getTokenSnapshot(tokenHash);
    }

    if (snapshot) this.redis.cacheValue(key, snapshot);

    return snapshot;
  }
}
