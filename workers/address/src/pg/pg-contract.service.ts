import { Injectable } from '@nestjs/common';
import { HelperService } from '../common';
import { ContractData } from '../models';

@Injectable()
export class PgContractService {
  constructor(private readonly helper: HelperService) {}

  /**
   * Save contract to database
   * contractData: ContractData
   * provider: Knex transaction provider
   */
  async createContractRecord(
    contractData: ContractData,
    provider: any,
  ): Promise<boolean> {
    const trx = await provider();
    return trx
      .insert(contractData)
      .into('contracts')
      .then(() => true)
      .catch(e => {
        this.helper.logError({
          method: 'createAddressRecord',
          data: contractData,
          e,
        });
        return true;
      });
  }
}
