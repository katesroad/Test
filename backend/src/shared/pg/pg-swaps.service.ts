import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { CustomLogger } from '../../common';

@Injectable()
export class PgSwapsService extends CustomLogger {
  constructor(@InjectKnex() private knex: Knex) {
    super('PgSwapService');
  }

  getOwnersSwaps(address: string) {
    return this.knex('swaps')
      .where({ owner: address })
      .andWhere({ deleted_at: null })
      .select('data', 'create_at');
  }

  getSwapByHash(hash: string) {
    return this.knex('swaps')
      .where({ hash })
      .limit(1)
      .first()
      .then(record => {
        console.log(record, hash);
        if (!record) return null;
        const swap: any = { ...record };
        delete swap.id;
        return swap;
      });
  }
}
