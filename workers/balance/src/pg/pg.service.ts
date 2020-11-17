import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { ITokenBalance, ITokenHolder } from '../models';
import { HelperService } from '../common';

/**
 * track token address pair with PostgreSQL database
 */
@Injectable()
export class PgService {
  constructor(
    @InjectKnex() private readonly knex: Knex,
    private readonly helper: HelperService,
  ) {}

  getTrxProvider() {
    return this.knex.transactionProvider();
  }

  /**
   * Check if a token address pair exsits in database
   * @returns boolean
   */
  async checkExistence(holder: ITokenHolder, provider: any): Promise<any> {
    const trx = await provider();
    return trx
      .from('token_holders')
      .where(holder)
      .select('qty', 'qty_in', 'qty_own')
      .limit(1)
      .first()
      .then(record => {
        if (record) {
          const { qty, qty_in, qty_own } = record;
          return { qty: +qty, qty_in: +qty_in, qty_own: +qty_own };
        }
        return null;
      });
  }

  /**
   * Create a token address pair
   * @param balance: Partial<ITokenBalance>
   * @returns boolean, true: created record, false: creation is failed
   */
  async createHolderRecord(
    balance: Partial<ITokenBalance>,
    provider: any,
  ): Promise<boolean> {
    const { data = null, ...others } = balance;
    const balanceData: any = others;
    if (data) {
      balanceData.data = JSON.stringify(data);
    }

    const trx = await provider();
    return trx
      .insert(balanceData)
      .into('token_holders')
      .then(() => {
        const { token, address } = balance;
        const pair = `token:${token}, addres:${address}`;
        this.helper.logInfoMsg(`Updated pair\n:${pair}`);
        return true;
      })
      .catch(e => {
        this.helper.logError({
          method: 'createBalanceRecord',
          data: balance,
          e,
        });
        return false;
      });
  }

  /**
   * Update a token address pair
   * @param balance: Partial<ITokenBalance>
   * @returns boolean, true: update successfully, false: update is failed
   */
  async updateHolderRecord(
    balance: Partial<ITokenBalance>,
    provider: any,
  ): Promise<boolean> {
    const { address, token, data = null, ...update } = balance;
    const updateData: any = update;
    if (data) {
      updateData.data = JSON.stringify(data);
    }
    const trx = await provider();

    return trx
      .update(updateData)
      .from('token_holders')
      .where({ address, token })
      .then(() => {
        const pair = `token:${token}, addres:${address}`;
        this.helper.logInfoMsg(`Updated pair\n:${pair}`);
        return true;
      })
      .catch(e => {
        this.helper.logError({
          method: 'updateBalanceRecord',
          e,
          data: balance,
        });
        return false;
      });
  }

  /**
   * Delete a token address pair
   * @param holder: {token:string, address:string},
   * @returns boolean, true: deleted, false: failed to delete record
   */
  async delHolderRecord(
    balance: Partial<ITokenBalance>,
    provider: any,
  ): Promise<boolean> {
    const { token, address } = balance;
    const trx = await provider();
    return trx
      .del()
      .from('token_holders')
      .where({ address, token })
      .then(() => {
        const pair = `token:${token}, addres:${address}`;
        this.helper.logInfoMsg(`Deleted pair\n:${pair}`);
        return true;
      })
      .catch(e => {
        this.helper.logError({ method: 'delBalanceRecord', e, data: balance });
        return true;
      });
  }
}
