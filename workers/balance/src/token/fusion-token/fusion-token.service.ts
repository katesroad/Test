import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FSN_TOKEN } from '../../constant';
import { CustomLogger } from '../../common';
import { ITokenHolder, TokenSnapshot } from '../../models';
import { IFusionToken } from '../token.interface';

@Injectable()
export class FusionTokenService extends CustomLogger implements IFusionToken {
  private tlRetried = 0;
  constructor(private http: HttpService, private config: ConfigService) {
    super('FusionTokenService');
  }

  async getTokenBalance(holder: ITokenHolder): Promise<string> {
    const method = 'fsn_getBalance';
    const { token, address } = holder;
    const params = [token, address];

    return this.makeRequest(method, params);
  }

  async getTokenTlBalance(holder: ITokenHolder, wait?: number): Promise<any[]> {
    if (wait) await this.sleep(wait);

    const method = 'fsn_getTimeLockBalance';
    const { token, address } = holder;
    const params = [token, address];
    return this.makeRequest(method, params)
      .then(async result => {
        if (result) {
          this.tlRetried = 0;
          return result.Items;
        } else {
          this.tlRetried += 1;
          if (this.tlRetried > 4) return [];
          return this.getTokenTlBalance(holder, 500);
        }
      })
      .catch(e => {
        this.tlRetried += 1;
        if (this.tlRetried > 4) return [];
        return this.getTokenTlBalance(holder, 500);
      });
  }

  // Get asset's key informaton: Decimals, Symbol
  async getTokenSnapshot(token: string): Promise<TokenSnapshot> {
    if (token === FSN_TOKEN) return { symbol: 'FSN', precision: 18 };

    const method = 'fsn_getAsset';
    const tokenInfo = await this.makeRequest(method, [token]);
    const { Symbol, Decimals } = tokenInfo;

    return { symbol: Symbol, precision: Decimals };
  }

  // Fusion RPC service: https://github.com/FUSIONFoundation/efsn/wiki/FSN-RPC-API
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
        this.logError({ method: 'makeRequest', e, data: { method, params } });
        // frequently request makes the rpc server socket hang out, restart application
        setTimeout(() => {
          process.exit();
        }, 100);
      });
  }

  private sleep(ms: number) {
    return new Promise(resolve => {
      let t = setTimeout(() => {
        clearTimeout(t);
        t = null;
        resolve(ms);
      }, ms);
    });
  }
}
