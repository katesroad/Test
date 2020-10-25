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
}
