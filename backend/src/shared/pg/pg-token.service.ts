import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { CustomLogger, QueryTokensCmdDto, QueryCmdDto } from '../../common';
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
    return this.knex('tokens')
      .where({ hash })
      .select(
        'hash',
        'name',
        'symbol',
        'issuer',
        'create_at',
        'holders',
        'txs',
        'qty',
        'precision',
        'verified',
      )
      .limit(1)
      .first();
  }

  getTokens(query: QueryTokensCmdDto): Promise<any> {
    const { cmd, size, anchor, type } = query;

    this.logInfo({ method: 'getTokens', data: { type, ...query } });

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

    const getTokensCount = this.knex('tokens')
      .where({ token_type: type })
      .count('id')
      .limit(1)
      .first()
      .then(record => {
        if (record) return record.count;
        else return 0;
      });
    let getTokens;

    if (['first', 'last'].includes(cmd)) {
      getTokens = this.knex('tokens')
        .where({ token_type: type })
        .orderBy('txs', order)
        .select(select)
        .limit(size)
        .then(tokens => {
          if (cmd == 'last') return tokens.reverse();
          else return tokens;
        });
    } else {
      getTokens = this.knex('tokens')
        .where({ token_type: type })
        .andWhere('txs', operator, anchor)
        .select(select)
        .orderBy('txs', order)
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
  }> {
    this.logInfo({ method: 'getTokensTxCount', data: token });

    return this.knex('tokens')
      .select('txs', 'holders')
      .where({ hash: token })
      .limit(1)
      .first();
  }

  // url example: https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7#balances
  getTokenHolders(token: string, query: QueryCmdDto): Promise<any> {
    let { cmd, anchor, size, sort = 'qty' } = query;
    let table = 'address_tokens';
    if (token.length === 42) {
      sort = 'qty';
      table = 'address_erc20_tokens';
    }

    this.logInfo({
      method: 'getTokenHolders',
      data: { table, ...query, sort },
    });

    const { order, operator } = this.helper.getOrderAndOperatorByCmd(cmd);

    let select = ['token', 'address', 'qty'];
    if (table === 'address_tokens') {
      select = [...select, 'qty_in'];
    }
    const getHoldersCount = this.getTokenStats(token).then(
      stats => stats.holders,
    );
    let getHolders;

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
          if (cmd === 'prev') return holders.reverse();
          else return holders;
        });
    }

    return Promise.all([getHolders, getHoldersCount]).then(data => {
      const [holders, total] = data;
      return { holders, total };
    });
  }

  private getTokenTable(token: string): string {
    if (token.length === 42) return 'erc20';
    else return 'tokens';
  }
}
