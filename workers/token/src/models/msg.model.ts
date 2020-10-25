export class TokenTxsCountMsg {
  token: string;
  txs: number;
  create_at: number;
  active_at: number;
}

export interface TokenHoldersCountMsg {
  token: string;
  count: 1 | -1;
}

export interface TokenErc20Msg {
  tx: string;
  timestamp: number;
}

export interface TokenChangeMsg {
  token: string;
}

export interface TokenGenerationMsg {
  tx: string;
}
