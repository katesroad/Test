import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';

@Injectable()
export class PgService {
  constructor(@InjectKnex() private readonly knex: Knex) {}

  getTrxProvider(): any {
    return this.knex.transactionProvider();
  }
}
