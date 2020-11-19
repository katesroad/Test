import { Injectable } from '@nestjs/common';
import { TokenMetaInfo } from 'src/models';
import { Erc20Service } from './erc20';
import { RpcService } from './rpc';

@Injectable()
export class TokenService {
  constructor(
    private readonly erc20: Erc20Service,
    private readonly rpc: RpcService,
  ) {}

  /**
   * Get Token metadata
   * @param tokenHash:string
   * @returns TokenMetaInfo
   */

  getTokenInfo(tokenHash: string): Promise<TokenMetaInfo | null> {
    if (this.isErc20Token(tokenHash)) {
      return this.erc20.getTokenInfo(tokenHash);
    } else {
      return this.rpc.getTokenInfo(tokenHash);
    }
  }

  /**
   * Get latest token supply(calculated from token suppy and decimals)
   * @param tokenHash string
   */
  async getTokenSupply(tokenHash: string): Promise<number> {
    if (this.isErc20Token(tokenHash)) {
      return this.erc20.getTokenSupply(tokenHash);
    }
    return this.rpc.getTokenSupply(tokenHash).catch(e => undefined);
  }

  /**
   * Test if a token hash is erc20 token hash
   * @param tokenHash: string
   * @returns boolean
   */
  isErc20Token(tokenHash: string): boolean {
    return tokenHash.length === 42;
  }

  /**
   * Test if a token hash is valid token hash
   * @param tokenHash: string
   * @returns boolean
   */
  isValidTokenHash(tokenHash: string): boolean {
    return tokenHash.length == 42 || tokenHash.length === 66;
  }
}
