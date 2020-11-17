import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HelperService } from '../../common';
import { FSN_TOKEN } from '../../constant';
import { ITokenHolder, TokenSnapshot } from '../../models';
import { IFusionToken } from '../token.interface';

/**
 * Interact with fusion rpc service to
 */
@Injectable()
export class FusionTokenService implements IFusionToken {
  private tlRetried = 0;
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly helper: HelperService,
  ) {}

  /**
   * Get address token balance
   * @param holder: {token:string, address:string}
   * @returns string
   */
  async getTokenBalance(holder: ITokenHolder): Promise<string> {
    const method = 'fsn_getBalance';
    const { token, address } = holder;
    const params = [token, address];

    return this.makeRequest(method, params);
  }

  /**
   * Get timelock balance for a token and address pair
   * @param holder: {address:string, token:string}
   * @returns {items?:ITimeLockRecord[], hasError: boolean}
   */
  async getTokenTlBalance(
    holder: ITokenHolder,
    wait?: number,
  ): Promise<{
    items?: any[];
    hasError: boolean;
  }> {
    if (wait) await this.helper.sleep(wait);

    const method = 'fsn_getTimeLockBalance';
    const { token, address } = holder;
    const params = [token, address];
    return this.makeRequest(method, params)
      .then(async result => {
        if (result) {
          this.tlRetried = 0;
          return {
            items: result.Items,
            hasError: false,
          };
        }
        this.tlRetried += 1;
        if (this.tlRetried > 4) {
          return { hasError: true };
        }
        return this.getTokenTlBalance(holder, 500);
      })
      .catch(e => {
        this.tlRetried += 1;
        if (this.tlRetried > 4) {
          return { hasError: true };
        }
        return this.getTokenTlBalance(holder, 500);
      });
  }

  /***
   * Get native token's symbol and decimails
   * @param token:string;
   * @returns {symbol:string, precision:number}
   */
  async getTokenSnapshot(token: string): Promise<TokenSnapshot> {
    if (token === FSN_TOKEN) return { symbol: 'FSN', precision: 18 };

    const method = 'fsn_getAsset';
    const tokenInfo = await this.makeRequest(method, [token]);
    const { Symbol, Decimals } = tokenInfo;

    return { symbol: Symbol, precision: Decimals };
  }

  // Interact with Fusion RPC service: https://github.com/FUSIONFoundation/efsn/wiki/FSN-RPC-API
  private async makeRequest(method: string, params: string[]): Promise<any> {
    const RPC_URL = this.config.get('rpc_url');
    return this.http
      .post(RPC_URL, {
        jsonrpc: '2.0',
        id: 1,
        method,
        params: [...params, 'latest'],
      })
      .toPromise()
      .then(res => res.data)
      .then(data => data.result)
      .catch(e => {
        this.helper.logError({
          method: 'makeRequest',
          e,
          data: { method, params },
        });

        // Frequently request RPC server make it hang out, restart workerclear
        setTimeout(() => {
          process.exit();
        }, 100);
      });
  }
}
