import { Injectable } from '@nestjs/common';
import { FSN_TOKEN } from '../../../common';
import { RpcHelperService } from '../../../helper';
import { TokenMetaData, TokenSnapshot } from '../../../models';
import { ITokenService } from './itoken-service.interface';

@Injectable()
export class FusionTokenService implements ITokenService {
  constructor(private rpc: RpcHelperService) {}

  /**
   * Get token meta information for native token
   * @param tokenHash: token hash
   * @returns token: TokenMetata | null
   */
  async getTokenInfo(tokenHash: string): Promise<TokenMetaData | null> {
    const method = 'fsn_getAsset';
    const params = [tokenHash];
    return this.rpc
      .makeRequest({ method, params })
      .then(data => {
        if (!data) return null;
        const { Name, Symbol, Total, Decimals, Description, Canchange } = data;
        return {
          name: Name,
          symbol: Symbol,
          qty: Total / Math.pow(10, Decimals),
          precision: Decimals,
          canchange: Canchange,
          info: Description,
        };
      })
      .catch(() => null);
  }

  /**
   * Get token's symbol and token's decimals by token hash
   * @param contracAdress erc20 token contract address
   * @returns snapshot: TokenSnapshot | null
   */
  async getTokenSnapshot(token: string): Promise<TokenSnapshot | null> {
    if (token === FSN_TOKEN) return { symbol: 'FSN', precision: 18 };

    return this.getTokenInfo(token)
      .then(data => {
        if (!data) return null;
        const { symbol, precision } = data;
        return { symbol, precision };
      })
      .catch(e => null);
  }
}
