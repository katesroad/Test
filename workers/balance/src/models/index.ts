import { ITokenBalance, ITokenHolder } from './address.model';

export * from './token.model';
export * from './msg.model';
export * from './address.model';

export interface BalancePair extends ITokenHolder {
  type: string;
}

export interface MsgBalancePair {
  address: string;
  tokens?: string[];
}

export enum PG_CMD {
  create = 'create',
  update = 'update',
  del = 'del',
  nil = '',
}
