import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import {
  TokensHoldersQueryDto,
  CustomLogger,
  QueryTokensCmdDto,
  QueryCmdDto,
} from '../../common';
import { IToken } from '../../models';
import { HelperService } from './helper.service';

@Injectable()
export class PgTokenService extends CustomLogger {
  constructor(
    @InjectKnex() private readonly knex: Knex,
    private readonly helper: HelperService,
  ) {
    super('PgTokenService');
  }

  getToken(hash: string) {
    const table = this.getTokenTable(hash);
    return this.knex(table)
      .where({ hash })
      .select('*')
      .limit(1)
      .first();
  }

  getTokens(query: QueryTokensCmdDto): Promise<any> {
    const { cmd, size, anchor, type } = query;
    let table = 'tokens';
    if (type === 1) table = 'erc20';

    this.logInfo({ method: 'getTokens', data: { table, type, ...query } });

    const { order, operator } = this.helper.getOrderAndOperatorByCmd(cmd);
    const select = [
      'id',
      'symbol',
      'qty',
      'hash',
      'name',
      'holders',
      'verified',
      'txs',
    ];

    const getTokensCount = this.knex(table)
      .select('id')
      .orderBy('id', 'desc')
      .limit(1)
      .first()
      .then(record => {
        if (record) return record.id;
        else return 0;
      });
    let getTokens;

    if (['first', 'last'].includes(cmd)) {
      getTokens = this.knex(table)
        .orderBy('holders', order)
        .select(select)
        .limit(size)
        .then(tokens => {
          if (cmd == 'last') return tokens.reverse();
          else return tokens;
        });
    } else {
      getTokens = this.knex(table)
        .where('holders', operator, anchor)
        .select(select)
        .orderBy('id', order)
        .limit(size)
        .then(tokens => {
          if (cmd === 'prev') return tokens.reverse();
          else return tokens;
        });
    }

    return Promise.all([getTokens, getTokensCount]).then(data => {
      return { tokens: data[0], total: data[1] };
    });
  }

  async getTokenStats(
    token: string,
  ): Promise<{
    txs: number;
    holders: number;
    create_at: number;
    active_at: number;
  }> {
    const table = this.getTokenTable(token);
    this.logInfo({ method: 'getTokensTxCount', data: { table, token } });

    return this.knex(table)
      .select('txs', 'holders', 'create_at', 'active_at')
      .where({ hash: token })
      .limit(1)
      .first();
  }

  // url example: https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7#balances
  getTokenHolders(token: string, query: QueryCmdDto): Promise<any> {
    console.log(query);
    let { cmd, anchor, size, sort = 'qty' } = query;
    let table = 'address_tokens';
    let holdersTable = 'tokens';
    if (token.length === 42) {
      sort = 'qty';
      table = 'address_erc20_tokens';
      holdersTable = 'erc20';
    }

    this.logInfo({
      method: 'getTokenHolders',
      data: { table, ...query, sort },
    });

    const { order, operator } = this.helper.getOrderAndOperatorByCmd(cmd);

    let select = ['token', 'address', 'qty'];
    if (table === 'address_tokens') {
      select = [...select, 'qty_in', 'qty_own'];
    }
    const getHoldersCount = this.knex(holdersTable)
      .where({ hash: token })
      .select('holders')
      .first()
      .limit(1)
      .then(record => {
        if (record) return record.holders;
        return 0;
      });
    let getHolders;

    console.log(anchor, cmd, sort, order, operator);
    if (['first', 'last'].includes(cmd)) {
      getHolders = this.knex(table)
        .where({ token })
        .orderBy(sort, order)
        .select(...select)
        .limit(size)
        .then(holdders => {
          if (cmd === 'last') return holdders.reverse();
          return holdders;
        });
    } else {
      getHolders = this.knex(table)
        .where({ token })
        .where(sort, operator, anchor)
        .orderBy(sort, order)
        .limit(size)
        .then(holders => {
          console.log(holders);
          if (cmd === 'prev') return holders.reverse();
          else return holders;
        });
    }

    return Promise.all([getHolders, getHoldersCount]).then(data => {
      const [holders, total] = data;
      return { holders, total };
    });
  }

  private cleanToken(tokenData: any): IToken {
    const token = { ...tokenData };
    delete token.id;
    return token;
  }

  private getTokenTable(token: string): string {
    if (token.length === 42) return 'erc20';
    else return 'tokens';
  }
}
