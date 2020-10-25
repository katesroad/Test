import { Injectable } from '@nestjs/common';
import { RpcHelperService } from '../../../helper';
import { TokenSnapshot } from '../../../models';
import { FSN_TOKEN } from '../../../common';

@Injectable()
export class FusionTokenService {
  constructor(private rpc: RpcHelperService) {}

  async getTokenSnapshot(token: string): Promise<TokenSnapshot> {
    if (token === FSN_TOKEN) return { symbol: 'FSN', precision: 18 };

    const method = 'fsn_getAsset';
    const params = [token];
    return this.rpc
      .makeRequest({ method, params })
      .then(data => {
        const { Symbol, Decimals } = data;
        return { symbol: Symbol, precision: +Decimals };
      })
      .catch(() => null);
  }
}
