export interface Erc20TokenInfo {
  hash: string;
  name: string;
  symbol: string;
  qty: number;
  precision: number;
}

export class Tokenstats {
  create_at: number;
  active_at: number;
  txs: number;
  holders: number;
}

export interface TokenInfo extends Erc20TokenInfo, Tokenstats {
  issuer: string;
  issue_tx: string;
  canchange: boolean;
  info: string; //JSON string
}
