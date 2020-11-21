import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import { ProcessedTx, PgTx } from '../../models';
import { HelperService } from '../../helper';

@Injectable()
export class PgTxsService {
  constructor(
    @InjectKnex() private knex: Knex,
    private readonly helper: HelperService,
  ) {}

  getTrxProvider(): any {
    return this.knex.transactionProvider();
  }

  async getTxTrackStartHeight(): Promise<number> {
    this.helper.logInfoMsg(`Getting tx track start height from pg.`);
    return this.knex('txs')
      .select('block', 'id')
      .orderBy('id', 'desc')
      .limit(1)
      .first()
      .then(record => {
        if (record) {
          const startAt = record.block;
          this.helper.logInfoMsg(`Tx track start height from pg:${startAt}.`);
          return startAt;
        }
      });
  }

  async saveProcessedTxs(
    txs: ProcessedTx[],
  ): Promise<{ txsIsSaved: boolean; txsCount?: number }> {
    const size = txs.length;
    const startAt = Date.now();
    const jsonlizedTxs = this.processTxs(txs);
    const select = ['id', 'tokens'];
    const provider = this.getTrxProvider();
    const trx = await provider();
    let txsCount = -1;

    return trx
      .insert(jsonlizedTxs)
      .into('txs')
      .returning(select)
      .then(statsList => {
        const records = [];
        statsList.map(stats => {
          const { id, tokens = [] } = stats;
          txsCount = Math.max(txsCount, id);
          if (tokens && tokens.length) {
            tokens.map(token => {
              records.push({ token, tx: id });
            });
          }
        });
        if (records.length === 0) return true;
        return this.saveTokenTxIdRecords(records, provider);
      })
      .then(result => {
        const cost = Date.now() - startAt;
        let msg: string;
        if (result) {
          msg = `Pg:inserted ${size} txs, cost:${cost} ms`;
          trx.commit();
        } else {
          msg = `Pg:insertion of ${size} txs failed , cost:${cost} ms`;
          trx.rollback();
        }
        this.helper.logInfoMsg(msg);
        return { txsCount, txsIsSaved: result };
      })
      .catch(e => {
        this.helper.logError({ method: 'saveProcessdTxs', e });
        trx.rollback();
        process.exit();
        return { txsCount: -1, txsIsSaved: false };
      });
  }

  private async saveTokenTxIdRecords(
    records: { tx_id: string; token: string }[],
    provider: any,
  ): Promise<boolean> {
    const trx = await provider();

    return trx
      .insert(records)
      .into('tx_token')
      .then(() => true)
      .catch(e => false);
  }

  private processTxs(txs: ProcessedTx[]): PgTx[] {
    return txs.map(tx => {
      const { data, tokens = [], ...rest } = tx;
      const pgTx: PgTx = { ...rest };
      if (data) pgTx.data = JSON.stringify(data);
      if (tokens.length) pgTx.tokens = JSON.stringify(tokens);
      return pgTx;
    });
  }
}
