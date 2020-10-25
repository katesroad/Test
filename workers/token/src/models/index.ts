import { TokenInfo } from './token.model';

export * from './token.model';
export * from './msg.model';

export enum DB_CMD {
  create = 'create',
  update = 'update',
}

export class DbOperation {
  record: Partial<TokenInfo>;
  cmd: string;
}
