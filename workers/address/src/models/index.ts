import { PgAddress } from './address.model';

export * from './msg.model';
export * from './address.model';

export enum PG_CMD {
  create = 'create',
  update = 'update',
}

export class DbOpeartion {
  record: Partial<PgAddress>;
  cmd: string;
}
