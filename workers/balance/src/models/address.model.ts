import { PG_CMD } from '.';

export interface ITimeLockRecord {
  value: number;
  startTime: number;
  endTime: number;
}

export interface ITokenHolder {
  address: string;
  token: string;
}

export interface ITokenBalance extends ITokenHolder {
  qty?: number;
  qty_in?: number;
  qty_own?: number;
  data?: any;
  token_type: number; // 0. native token, 1: erc20 token
}

export interface ITokenTlBalance extends ITokenHolder {
  data?: ITimeLockRecord[];
  qty_in?: number;
}

export interface PgTokenPrevBalance extends Partial<ITokenHolder> {
  qty: number;
  qty_in: number;
  qty_own: number;
}

export interface AddresBalancesOperation {
  record: Partial<ITokenBalance>;
  cmd: PG_CMD.create | PG_CMD.update | PG_CMD.del;
  change: number;
  type: string; //tl_balance | balance
}

export enum PAIR_TYPE {
  balance = 'balance',
  tl_balance = 'tl_bnalance',
}
