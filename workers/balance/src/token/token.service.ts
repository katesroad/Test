import { Injectable } from '@nestjs/common';
import { FusionTokenService } from './fusion-token';
import { Erc20TokenService } from './erc20-token';
import { RedisHelperService } from '../common/redis-helper';
import {
  TokenSnapshot,
  ITokenHolder,
  ITokenBalance,
  ITokenTlBalance,
  ITimeLockRecord,
} from '../models';
import { HelperService } from '../common';

@Injectable()
export class TokenService {
  constructor(
    private redis: RedisHelperService,
    private erc20: Erc20TokenService,
    private fusion: FusionTokenService,
    private helper: HelperService,
  ) {}

  /**
   * Get token balance for an address
   * @param holder ITokenHolder
   * @return {qty:number, token:string, address:string} | null
   */
  getTokenBalance(holder: ITokenHolder): Promise<ITokenBalance | null> {
    let getRawBalance: Promise<string>;
    if (this.isErc20Token(holder.token)) {
      getRawBalance = this.erc20.getTokenBalance(holder);
    } else {
      getRawBalance = this.fusion.getTokenBalance(holder);
    }

    return Promise.all([getRawBalance, this.getTokenSnapshot(holder.token)])
      .then(data => {
        const [balance, snapshot] = data;
        // Has error, don't track holder pair
        if (!snapshot || !balance) return null;
        const qty = this.calcTokenQty(balance, snapshot);
        return { ...holder, qty };
      })
      .catch(e => {
        this.helper.logError({ method: 'getTokenBalance', e, data: holder });
        console.log(e);
        // Has error, don't track holder pair
        return null;
      });
  }

  /**
   * get timelock balance for a token and address pair
   * @param holder ITokenHolder
   * @return {qty_in?:number, data?:any, token:string, address:string} | null
   */
  async getTokenTlBalance(
    holder: ITokenHolder,
  ): Promise<ITokenTlBalance | null> {
    const getItems = this.fusion.getTokenTlBalance(holder);
    const getSnapshot = this.getTokenSnapshot(holder.token);

    const { tlResult, snapshot, hasError = false } = await Promise.all([
      getItems,
      getSnapshot,
    ])
      .then(data => ({ tlResult: data[0], snapshot: data[1] }))
      .catch(e => {
        this.helper.logError({ method: 'getTokenTlBalance', e, data: holder });
        return { hasError: true } as any;
      });

    // only update if got right value
    if (hasError || tlResult.hasError) return null;

    const { items = [] } = tlResult;
    if (items.length === 0) {
      return { qty_in: 0, data: null, ...holder };
    }

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
    if (balance.data === undefined || balance.qty_in === undefined) {
      return null;
    }
    return balance;
  }

  /**
   * Test if a hash is an erc20 token string
   * @param token string
   * @return boolean
   */
  isErc20Token(token: string) {
    return token.length == 42;
  }

  /**
   * get balance value based on token decimals and raw balance
   * @param balance:string
   * @param token: string
   * @return number
   */
  private calcTokenQty(balance: string, token: TokenSnapshot): number {
    return +balance / Math.pow(10, token.precision);
  }

  /**
   * Get token key information
   * @param token string
   * @return {precision: number, symbol:string} | null
   */
  private async getTokenSnapshot(token: string): Promise<TokenSnapshot> {
    const key = `token:${token}:snapshot`;
    let snapshot: TokenSnapshot = await this.redis
      .getCachedValue(key)
      .then(snapshot => JSON.parse(snapshot));

    if (snapshot) return snapshot;

    if (this.isErc20Token(token)) {
      snapshot = await this.erc20.getTokenSnapshot(token);
    } else {
      snapshot = await this.fusion.getTokenSnapshot(token);
    }

    this.redis.cacheValue(key, JSON.stringify(snapshot));

    return snapshot;
  }
}
