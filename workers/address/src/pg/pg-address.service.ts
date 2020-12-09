import { Injectable } from '@nestjs/common';
import { PgAddressData } from '../models';
import { HelperService } from '../common';

@Injectable()
export class PgAddressService {
  constructor(private readonly helper: HelperService) {}

  async checkAdressRecord(hash: string, provider: any) {
    const trx = await provider();
    return trx
      .from('address')
      .where({ hash })
      .select('*')
      .limit(1)
      .first();
  }

  async createAddressRecord(
    addressData: PgAddressData,
    provider: any,
  ): Promise<boolean> {
    const trx = await provider();
    return trx
      .insert(addressData)
      .into('address')
      .catch(e => {
        this.helper.logError({
          method: 'createAddressRecord',
          data: addressData,
          e,
        });
        console.log(e);
        process.exit();
        return false;
      });
  }

  async updateAddressRecord(
    addressData: PgAddressData,
    provider: any,
  ): Promise<boolean> {
    const { hash, ...update } = addressData;
    const trx = await provider();
    return trx
      .update(update)
      .from('address')
      .where({ hash })
      .catch(e => {
        this.helper.logError({
          method: 'updateAddressRecord',
          e,
          data: addressData,
        });
        console.log(e);
        process.exit();
        return false;
      });
  }
}
