export interface IToken {
  name: string;
  hash: string;
  qty: number;
  precision: number;
  issuer?: string;
  verified?: boolean;
  changeable?: boolean;
  holders: number;
  txs: number;
  description?: any;
  info?: any;
}

export interface ITokenHolder {
  address: string;
  label?: string;
  qty: number;
  qty_own: number;
  qty_in: number;
}
