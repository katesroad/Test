import { Injectable, HttpService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from '../../common/custom-logger';
import { TokenInfo } from '../../models';

@Injectable()
export class RpcService extends CustomLogger {
  private retried = 0;
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    super(`RpcHelperService`);
  }

  async getTokenInfo(token: string): Promise<Partial<TokenInfo>> {
    // https://github.com/fsn-dev/fsn-rpc-api/blob/master/fsn-rpc-api.md#fsn_getasset
    const method = 'fsn_getAsset';
    const RPC_URL = this.config.get('rpc_url');
    return this.http
      .post(
        RPC_URL,
        {
          jsonrpc: '2.0',
          id: 1,
          method,
          params: [token, 'latest'],
        },
        { headers: { 'Content-Type': 'application/json' } },
      )
      .toPromise()
      .then(res => res.data)
      .then(data => data.result)
      .then(data => {
        this.retried = 0;
        const { Total, Symbol, Name, Owner, Decimals } = data;
        const qty = +Total / Math.pow(10, Decimals);
        return {
          qty,
          name: Name,
          issuer: Owner,
          precision: Decimals,
          symbol: Symbol,
        };
      })
      .catch(e => {
        this.retried += 1;
        if (this.retried > 4) {
          this.logError({
            method: 'getTokenInfo',
            e,
            data: token,
          });
          return {};
        }
        return this.getTokenInfo(token);
      });
  }
}
