import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../common';
import { FusionTokenService } from './fusion-token';
import { Erc20TokenService } from './erc20-token';
import { RedisHelperService } from '../redis-helper';
import {
  TokenSnapshot,
  ITokenHolder,
  ITokenBalance,
  ITokenTlBalance,
  ITimeLockRecord,
} from '../models';

@Injectable()
export class TokenService extends CustomLogger {
  constructor(
    private redis: RedisHelperService,
    private erc20: Erc20TokenService,
    private fusion: FusionTokenService,
  ) {
    super('TokenService');
  }

  getTokenBalance(holder: ITokenHolder): Promise<ITokenBalance> {
    let getRawBalance: Promise<string>;
    if (this.isErc20Hash(holder.token)) {
      getRawBalance = this.erc20.getTokenBalance(holder);
    } else {
      getRawBalance = this.fusion.getTokenBalance(holder);
    }

    return Promise.all([getRawBalance, this.getTokenSnapshot(holder.token)])
      .then(data => {
        const [balance, snapshot] = data;
        if (!snapshot || !balance) return null;
        const qty = this.calcTokenQty(balance, snapshot);
        return { ...holder, qty };
      })
      .catch(e => {
        this.logError({ method: 'getTokenBalance', e, data: holder });
        console.log(e);
        // dont update in case of blocking balance updation for other addresses
        return {...holder};
      });
  }

  async getTokenTlBalance(holder: ITokenHolder): Promise<ITokenTlBalance> {
    const getItems = this.fusion.getTokenTlBalance(holder);
    const getSnapshot = this.getTokenSnapshot(holder.token);

    const { items = [], snapshot } = await Promise.all([getItems, getSnapshot])
      .then(data => {
        const [items, snapshot] = data;
        return { items, snapshot };
      })
      .catch(e => {
        this.logError({ method: 'getTokenTlBalance', e, data: holder });
        return null;
      });

    if (!items.length || !snapshot) return { ...holder };

    const FOREVER = 18446744073709552000;
    let qty_in = -1;
    const data: ITimeLockRecord[] = [];
    items.map(({ Value, StartTime, EndTime }) => {
      const value = this.calcTokenQty(Value, snapshot);
      if (EndTime === FOREVER) {
        qty_in = qty_in === -1 ? value : qty_in + value;
      }
      const record = { value, startTime: StartTime, endTime: EndTime };
      const nowTimeStamp = Math.floor(Date.now() / 1000);
      if (nowTimeStamp < EndTime) data.push(record);
      data.push(record);
    });

    const balance: ITokenTlBalance = { ...holder };
    if (data.length) balance.data = data;
    if (qty_in !== -1) balance.qty_in = qty_in;

    return balance;
  }

  isErc20Hash(token: string) {
    return token.length == 42;
  }

  private calcTokenQty(balance: string, token: TokenSnapshot): number {
    return +balance / Math.pow(10, token.precision);
  }

  private async getTokenSnapshot(token: string): Promise<TokenSnapshot> {
    const key = `token:${token}:snapshot`;
    let snapshot: TokenSnapshot = await this.redis
      .getCachedValue(key)
      .then(snapshot => JSON.parse(snapshot));

    if (snapshot) return snapshot;

    if (this.isErc20Hash(token)) {
      snapshot = await this.erc20.getTokenSnapshot(token);
    } else {
      snapshot = await this.fusion.getTokenSnapshot(token);
    }

    this.redis.cacheValue(key, JSON.stringify(snapshot));

    return snapshot;
  }
}
