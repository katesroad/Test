import { Injectable } from '@nestjs/common';
import Knex from 'knex';
import { InjectKnex } from 'nestjs-knex';
import { TokenData } from '../../models';

@Injectable()
export class PgTokenService {
  constructor(@InjectKnex() private knex: Knex) {}

  createTokenRecord(tokenData: TokenData): Promise<boolean> {
    return this.knex('tokens')
      .insert(tokenData)
      .then(() => true)
      .catch(e => false);
  }
}
