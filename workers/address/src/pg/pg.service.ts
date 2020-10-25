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
      .catch(e => {
        this.logError({ method: 'createAddressRecord', data: addressData, e });
        console.log(e);
        process.exit();
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
      .catch(e => {
        this.logError({ method: 'updateAddressRecord', e, data: addressData });
        console.log(e);
        process.exit();
        return false;
      });
  }
}
