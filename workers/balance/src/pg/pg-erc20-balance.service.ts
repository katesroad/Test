import { Injectable } from '@nestjs/common';
import { PgCrud } from './pg-crud.class';

@Injectable()
export class PgErc20BalanceService extends PgCrud {
  readonly table = 'address_erc20_tokens';
  readonly select = ['qty'];

  constructor() {
    super('PgErc20BalanceService');
  }
}
