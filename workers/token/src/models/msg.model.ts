import { TokenStats, TokenStatsData } from './token.model';

export type TonkenStatsMsg = TokenStats;

export interface TokenHoldersMsg {
  token: string;
  holders: number;
}

export interface TokenErc20Msg {
  tx: string;
  timestamp: number;
}

export interface TokenChangeMsg {
  token: string;
}

export interface HoldersChangeMsg {
  token: string;
  change: number;
}
