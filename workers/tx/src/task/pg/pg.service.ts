import { Injectable } from '@nestjs/common';
import { InjectKnex, Knex } from 'nestjs-knex';
import {
  ProcessedTx,
  PgTx,
  RangeTxsStats,
  TokenMetaData,
  TokenData,
} from '../../models';
import { CustomLogger } from '../../common';

@Injectable()
export class PgService extends CustomLogger {
  constructor(@InjectKnex() private knex: Knex) {
    super('PgService');
  }

  getTrxProvider(): any {
    return this.knex.transactionProvider();
  }

  async getTxTrackStartHeight(): Promise<number> {
    this.logInfoMsg(`Getting tx track start height from pg.`);
    return this.knex('txs')
      .select('block', 'id')
      .orderBy('id', 'desc')
      .limit(1)
      .first()
      .then(record => {
        if (record) {
          const startAt = record.block;
          this.logInfoMsg(`Tx track start height from pg:${startAt}.`);
          return startAt;
        }
      });
  }

  getTxStatsTrackStartTime(): Promise<number> {
    this.logInfoMsg(`Getting txs stats start time from pg.`);
    return this.knex('txs_stats')
      .select('stats_at')
      .orderBy('stats_at', 'desc')
      .limit(1)
      .first()
      .then((record: { stats_at: number }) => {
        if (record) return record.stats_at;
      });
  }

  async saveTxsStats(statsData: RangeTxsStats): Promise<boolean> {
    const { stats_at, stats } = statsData;
    const startAt = Date.now();
    return this.knex(`txs_stats`)
      .insert({ stats_at, stats: JSON.stringify(stats) })
      .then(() => {
        const cost = Date.now() - startAt;
        this.logInfoMsg(`Saved txs stats, cost ${cost} ms`);
        return true;
      })
      .catch(e => {
        this.logError({ method: `saveTxsStats`, e, data: statsData });
        return false;
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
        this.logInfoMsg(msg);
        return { txsCount, txsIsSaved: result };
      })
      .catch(e => {
        this.logError({ method: 'saveProcessdTxs', e });
        trx.rollback();
        process.exit();
        return { txsCount: -1, txsIsSaved: false };
      });
  }

  async getSwap(swapID: string, provider: any) {
    const trx = await provider();
    return trx
      .select('from_tokens', 'to_tokens', 'owner')
      .from('swaps')
      .where({ hash: swapID })
      .first()
      .limit(1)
      .then(record => {
        const { from_tokens = [], to_tokens = [], owner = '' } = record || {};
        return { FromAssetID: from_tokens, ToAssetID: to_tokens, owner };
      })
      .catch(e => {
        this.logError({ method: 'getSwap', e });
        process.exit();
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

  async trackSwap(swap: any, provider: any) {
    const trx = await provider();
    const { hash, ...swapData } = swap;
    const isExist = await trx
      .from('swaps')
      .where({ hash })
      .select('hash')
      .limit(1)
      .first()
      .catch(e => {
        console.log(e);
        process.exit();
      });

    if (isExist || !swapData.owner) {
      return trx
        .update(swapData)
        .from('swaps')
        .where({ hash })
        .then(() => {
          this.logInfoMsg(`updated swap ${hash}`);
          return true;
        })
        .catch(e => {
          this.logErrorMsg(`update swap ${hash} failed`);
          console.log(e);
          return false;
        });
    }
    return trx
      .insert(swap)
      .into('swaps')
      .then(() => {
        this.logInfoMsg(`created swap ${hash}`);
        return true;
      })
      .catch(e => {
        this.logErrorMsg(`create swap ${hash} failed`);
        console.log(e, swap);
        return false;
      });
  }

  saveTokenInfo(tokenData: TokenData): Promise<boolean> {
    return this.knex('tokens')
      .insert(tokenData)
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
