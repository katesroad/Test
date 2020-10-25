import { Injectable } from '@nestjs/common';
import { HoldingsStats, PgAddress } from './models';
import { PgService } from './pg';
import { CustomLogger } from './common';

@Injectable()
export class AppService extends CustomLogger {
  constructor(private pg: PgService) {
    super('AppService');
  }

  async trackAddress(msg: any): Promise<boolean> {
    const { address, ...others } = msg;

    const provider = this.pg.getTrxProvider();
    const trx = await provider();
    const prevRecord = await this.pg.checkExistence(address, provider);

    if (!prevRecord) {
      const addressData = { hash: address, ...others };
      return this.pg
        .createAddressRecord(addressData, provider)
        .then(res => {
          if (res) trx.commit();
          else trx.rollback();
          return res;
        })
        .catch(e => {
          this.logError({ method: 'trackAddress', e });
          trx.rollback();
          return false;
        });
    }

    const { create_at = Infinity, txs = 0, active_at = -Infinity } = prevRecord;
    const update: Partial<PgAddress> = { hash: address, ...others };
    if (others.create_at) {
      update.create_at = Math.min(create_at, others.create_at);
    }
    if (others.active_at) {
      update.active_at = Math.max(others.active_at, active_at);
    }
    if (others.txs) {
      update.txs += others.txs + +txs;
    }
    return this.pg
      .updateAddressRecord(update, provider)
      .then(res => {
        if (res) trx.commit();
        else trx.rollback();
        return res;
      })
      .catch(e => {
        this.logError({ method: 'trackAddress', e });
        trx.rollback();
        return false;
      });
  }

  async statsAddressHolings(msg: HoldingsStats): Promise<boolean> {
    const { address, type, count } = msg;
    const field = this.pg.getFieldForHolingType(type);

    // msg is incorrect
    if (!field) {
      console.log(msg);
      process.exit();
    }

    const provider = this.pg.getTrxProvider();
    const trx = await provider();

    const prevRecord = await this.pg.checkExistence(address, provider);

    if (!prevRecord) {
      const addressData = { hash: address, [field]: count };
      return this.pg
        .createAddressRecord(addressData, provider)
        .then(res => {
          if (res) trx.commit();
          else trx.rollback();
          return res;
        })
        .catch(e => {
          this.logError({ method: 'statsAddressHoldings', e });
          trx.rollback();
          return false;
        });
    }

    const update: any = { hash: address };
    update[field] = (+prevRecord[field] || 0) + count;
    return this.pg
      .updateAddressRecord(update, provider)
      .then(res => {
        if (res) trx.commit();
        else trx.rollback();
        return res;
      })
      .catch(e => {
        this.logError({ method: 'statsAddress', e });
        return false;
      });
  }
}
