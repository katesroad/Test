import { Injectable } from '@nestjs/common';
import { HelperService } from 'src/common';
import { TokenInfo } from '../models';

@Injectable()
export class PgTokensService {
  private table = 'tokens';

  constructor(private readonly helper: HelperService) {}

  /**
   * Check if a token is in PostgreSQL DB
   * @param tokenHash:string
   * @returns Partial<TokenInfo> | null
   */
  async checkTokenRecord(
    tokenHash: string,
    provider: any,
  ): Promise<TokenInfo | null> {
    const trx = await provider();

    return trx
      .where({ hash: tokenHash })
      .select('id')
      .from(this.table)
      .limit(1)
      .first();
  }

  /**
   * Create a token record in PostgreSQL db
   * @params token: tokenInfo, provider:Knex transaction provider
   * @returns boolean
   */
  async createTokenRecord(
    token: Partial<TokenInfo>,
    provider: any,
  ): Promise<boolean> {
    const trx = await provider();
    const { hash } = token;
    return trx
      .insert(token)
      .into(this.table)
      .then(() => {
        this.helper.logInfoMsg(`Created token:${hash}!`);
        return true;
      })
      .catch(e => {
        this.helper.logError({ method: 'createToken', data: token, e });
        return false;
      });
  }

  /**
   * Update token data
   * @param token: Partial<TokenInfo>
   * @param provider: PostgreSQL transaction provider by Knex
   * @returns boolean. true: update is sucessful, false; update is failed
   */
  async updateTokenRecord(
    token: Partial<TokenInfo>,
    provider: any,
  ): Promise<boolean> {
    const { hash, ...update } = token;

    if (Object.keys(update).length === 0) return true;

    const trx = await provider();
    return trx
      .update(update)
      .from(this.table)
      .where({ hash })
      .catch((e: any) => {
        this.helper.logError({ method: 'udpateToken', e, data: token });
        return false;
      });
  }
}
