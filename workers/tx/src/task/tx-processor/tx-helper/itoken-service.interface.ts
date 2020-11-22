import { TokenMetaData, TokenSnapshot } from 'src/models';

export interface ITokenService {
  getTokenSnapshot(tokenHash: string): Promise<TokenSnapshot | null>;
  getTokenInfo(tokenHash: string): Promise<TokenMetaData | null>;
}
