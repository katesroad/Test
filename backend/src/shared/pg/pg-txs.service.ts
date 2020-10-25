import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { ITx, ITxs } from '../../models';
import { CustomLogger, QueryCmdDto } from '../../common';
import { HelperService } from './helper.service';

@Injectable()
export class PgTxsService extends CustomLogger {
  private select = [
    'id',
    'hash',
    'sender',
    'receiver',
    'data',
    'block',
    'type',
    'age',
    'fee',
    'status',
  ];
  constructor(
    @InjectKnex() private knex: Knex,
    private readonly helper: HelperService,
  ) {
    super('PgTxService');
  }

  async getTxByHash(hash: string): Promise<ITx> {
    const select = [...this.select, 'tokens'];
    return this.knex('txs')
      .where({ hash })
      .limit(1)
      .select(...select)
      .first();
  }

  async getAddressTxs(address: string, query: QueryCmdDto): Promise<ITx[]> {
    const { cmd, size = 10, anchor = null } = query;
    const descQueryCmds = ['first', 'next'];
    const order = descQueryCmds.includes(cmd) ? 'desc' : 'asc';
    const select = this.select.join(',');
    const sql = `
        select 
          ${select}
        from txs
          where id in (
          select * from address_txs_${order}('${address}', ${size}, ${anchor})
        )
        order by id desc
      `;
    return this.knex
      .raw(sql)
      .then(rawData => rawData.rows)
      .then(records => {
        if (descQueryCmds.includes(cmd)) return records.slice(0, size);
        else return records.slice(-size);
      });
  }

  async getTxs(query: QueryCmdDto, anyswap?: boolean): Promise<ITxs> {
    let table = 'txs';
    if (anyswap) table = 'anyswap';
    this.logInfo({ method: 'getTxs', data: { table, ...query } });

    const { cmd, size, anchor = null } = query;
    const { order } = this.helper.getOrderAndOperatorByCmd(cmd);
    const select = this.select;

    const getTxCount = this.knex(table)
      .select('id')
      .orderBy('id', 'desc')
      .limit(1)
      .first()
      .then(record => {
        if (record) return record.id;
        else return 0;
      });

    const sql = `
        select 
          ${select}
        from txs
          where id in (
          select * from range_txs_${order}(${size}, ${anchor})
        )
        order by id desc
      `;
    const getTxs = this.knex.raw(sql).then(rawData => rawData.rows);

    return Promise.all([getTxs, getTxCount]).then(data => {
      return { txs: data[0], total: data[1] };
    });
  }

  async getBlocksTxs(block: number): Promise<ITx[]> {
    this.logInfo({ method: 'getBlocksTxs', data: { block } });

    const select = this.select;
    return this.knex('txs')
      .where({ block })
      .select(select)
      .then(records => records.map(record => this.cleanTx(record)));
  }

  async getTokensTxs(token: string, query: QueryCmdDto): Promise<ITx[]> {
    this.logInfo({
      method: 'getTokensTxs',
      data: { token, ...query },
    });

    const { cmd, size, anchor = null } = query;
    const { order } = this.helper.getOrderAndOperatorByCmd(cmd);
    const select = this.select;

    const sql = `
        select 
          ${select}
        from txs
          where id in (
          select * from token_txs_${order}('${token}', ${size}, ${anchor})
        )
        order by id desc
      `;
    return this.knex.raw(sql).then(rawData => rawData.rows);
  }

  private cleanTx(txData: any, delId?: boolean): ITx {
    const { data = null, ...tx } = txData;
    if (data) tx.data = data;
    if (delId) delete tx.id;
    return tx;
  }
}
