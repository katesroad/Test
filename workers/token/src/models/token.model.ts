// for erc20 token
export interface TokenMetaInfo {
  hash: string;
  name: string;
  symbol: string;
  qty: number;
  precision: number;
}

// for native token
export interface NativeTokenMetaInfo extends TokenMetaInfo {
  canchange: boolean;
  info?: any;
}

export type TokenInfo = NativeTokenMetaInfo | TokenMetaInfo;

export class TokenStatsData {
  txs: number;
  transfers: number;
  pair_swap: number;
  pair_add: number;
  pair_rm: number;
  holders: number;
  active_at: number;
}

export class TokenStats extends TokenStatsData {
  token: string;
}
