import { TokenInfo, TokenStats } from './token.model';

export * from './token.model';
export * from './msg.model';

export enum DB_CMD {
  create = 'create',
  update = 'update',
  nil = '',
}

export class DbStatsOperation {
  record: Partial<TokenStats> | null;
  cmd: string;
}
