import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { IAddress } from '../../models';
import { CustomLogger } from '../../common';
import { HelperService } from '../helper';

@Injectable()
export class PgAddressService extends CustomLogger {
  constructor(
    @InjectKnex() private knex: Knex,
    readonly helper: HelperService,
  ) {
    super('PgAddressService');
  }

  public getLabeledAddresses(): Promise<object> {
    this.logInfo({ method: 'getLabeledAddresses' });

    return this.knex('address')
      .whereNotNull('label')
      .select('hash', 'label')
      .then(records => {
        if (!records.length) return {};
        const map = {};
        records.map(record => (map[record.hash] = record.label));
        return map;
      });
  }

  getAddressOverview(hash: string): Promise<IAddress> {
    this.logInfo({ method: 'getAddressOverview', data: hash });

    return this.knex('address_overview_view')
      .where({ hash })
      .first()
      .limit(1)
      .then(overview => {
        const { txs = 0, ...others } = overview || {};
        return { ...others, txs };
      });
  }

  getAdressFusionTokens(address: string): Promise<any[]> {
    this.logInfo({ method: 'getAddressFusionTokens', data: address });

    return this.knex('address_tokens_view').where({ address });
  }

  getAdressErc20Tokens(address: string): Promise<any[]> {
    this.logInfo({ method: 'getAdressErc20Tokens', data: address });

    return this.knex('address_erc20_tokens_view').where({ address });
  }

  getAddressTlTokens(address: string): Promise<any[]> {
    this.logInfo({ method: 'getAddressTlTokens', data: address });

    return this.knex('address_tl_tokens_view').where({ address });
  }

  getAddressHashByUSAN(usan: number): Promise<string> {
    this.logInfo({ method: 'getAddressTlTokens', data: usan });

    return this.knex('address')
      .select('hash')
      .where({ usan })
      .limit(1)
      .first()
      .then(record => {
        if (record) return record.hash;
        throw new BadRequestException(`Can't find address with usan ${usan}.`);
      });
  }

  getAddressStats(
    hash: string,
  ): Promise<{
    txs: number;
    anchor?: { first: number; last: number };
  }> {
    return this.knex('address')
      .where({ hash })
      .select('txs', 'create_at', 'active_at')
      .first()
      .limit(1);
  }
}
