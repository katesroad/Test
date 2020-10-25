import { Injectable } from '@nestjs/common';
import { PgCrud } from './pg-crud.class';

@Injectable()
export class PgAssetBalanceService extends PgCrud {
  readonly table = 'address_tokens';
  readonly select = ['qty', 'qty_in', 'qty_own'];

  constructor() {
    super('PgAssetBalanceService');
  }
}
