import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { TokenInfo } from '../models';
import { CustomLogger } from '../common';

@Injectable()
export class PgService extends CustomLogger {
  constructor(@InjectKnex() private readonly knex: Knex) {
    super('PgService');
  }

  getTrxProvider(): any {
    return this.knex.transactionProvider();
  }

  async checkExistence(token: string, provider: any): Promise<TokenInfo> {
    const trx = await provider();

    return trx
      .where({ hash: token })
      .select('holders', 'txs', 'create_at')
      .from('tokens')
      .limit(1)
      .first()
      .then(record => {
        if (record) {
          this.logInfoMsg(`token:${token} is in db`);
        } else {
          this.logInfoMsg(`token ${token} is not in db`);
        }
        return record;
      })
      .catch(e => {
        this.logError({ method: 'checkExist', data: token, e });
        return false;
      });
  }

  async createToken(
    token: Partial<TokenInfo>,
    provider: any,
  ): Promise<boolean> {
    const trx = await provider();
    return trx
      .insert(token)
      .into('tokens')
      .then(() => true)
      .catch(e => {
        this.logError({ method: 'createToken', data: token, e });
        return false;
      });
  }

  async updateToken(
    token: Partial<TokenInfo>,
    provider: any,
  ): Promise<boolean> {
    const { hash, ...update } = token;
    const trx = await provider();

    return trx
      .update(update)
      .from('tokens')
      .where({ hash })
      .catch((e: any) => {
        this.logError({ method: 'udpateToken', e, data: token });
        return false;
      });
  }
}
