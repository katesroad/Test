import { ITokenHolder, PgTokenPrevBalance } from '../models';
import { CustomLogger } from '../common';

export abstract class PgCrud extends CustomLogger {
  protected select: string[];
  protected table: string;

  constructor(name: string) {
    super(name);
  }

  async checkExistence(
    holder: ITokenHolder,
    provider: any,
  ): Promise<Partial<PgTokenPrevBalance>> {
    const trx = await provider();
    const select = this.select;
    const table = this.table;

    return trx
      .from(table)
      .where(holder)
      .select(...select)
      .limit(1)
      .first();
  }

  async createBalanceRecord(data: any, provider: any): Promise<boolean> {
    const trx = await provider();
    const table = this.table;

    return trx
      .insert(data)
      .into(table)
      .then(() => true)
      .catch(e => {
        this.logError({ method: 'createBalanceRecord', data, e });
        return false;
      });
  }

  async updateBalanceRecord(data: any, provider: any): Promise<boolean> {
    const { address, token, ...update } = data;
    const trx = await provider();
    const table = this.table;

    return trx
      .update(update)
      .from(table)
      .where({ address, token })
      .then(() => true)
      .catch(e => {
        this.logError({ method: 'updateBalanceRecord', e, data });
        return false;
      });
  }

  async delBalanceRecord(data: ITokenHolder, provider: any): Promise<boolean> {
    this.logInfo({
      method: `${this.table}:delBalanceRecord`,
    });

    const trx = await provider();
    const { address, token } = data;
    const table = this.table;

    return trx
      .del()
      .from(table)
      .where({ address, token })
      .then(() => true)
      .catch(e => {
        this.logError({ method: 'delBalanceRecord', e, data });
        return true;
      });
  }
}
