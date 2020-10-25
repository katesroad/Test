import { TokenSnapshot, ITokenHolder } from '../models';

export interface IToken {
  getTokenSnapshot(token: string): Promise<TokenSnapshot>;

  getTokenBalance(holder: ITokenHolder): Promise<string>;
}

export interface IFusionToken extends IToken {
  getTokenTlBalance(holder: ITokenHolder): Promise<any[]>;
}
