import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { CustomLogger } from '../common';
import { PgAddress } from '../models';

@Injectable()
export class PgService extends CustomLogger {
  constructor(@InjectKnex() private knex: Knex) {
    super('PgService');
  }

  getTrxProvider() {
    return this.knex.transactionProvider();
  }

  async checkExistence(hash: string, provider: any) {
    const trx = await provider();

    return trx
      .from('address')
      .where({ hash })
      .select('*')
      .limit(1)
      .first();
  }

  getFieldForHolingType(type: string): string {
    switch (type) {
      case 'erc20':
        return 'erc20_tokens';
      case 'fusion':
        return 'fusion_tokens';
      case 'tl':
        return 'tl_tokens';
      default:
        return;
    }
  }

  async createAddressRecord(
    addressData: Partial<PgAddress>,
    provider: any,
  ): Promise<boolean> {
    const trx = await provider();
    return trx
      .insert(addressData)
      .into('address')
      .then(() => {
        trx.commit();
        return true;
      })
      .catch(e => {
        this.logError({ method: 'createAddressRecord', data: addressData, e });
        trx.rollback();
        return false;
      });
  }

  async updateAddressRecord(
    addressData: Partial<PgAddress>,
    provider: any,
  ): Promise<boolean> {
    const { hash, ...update } = addressData;
    const trx = await provider();

    return trx
      .update(update)
      .from('address')
      .where({ hash })
      .then(() => {
        trx.commit();
        return true;
      })
      .catch(e => {
        this.logError({ method: 'updateBalanceRecord', e, data: addressData });
        trx.rollback();
        return false;
      });
  }
}
