import { Injectable } from '@nestjs/common';
import {
  AddressHoldingStatsMsg,
  AddressStats,
  AddressTxStatsMsg,
  DbOpeartion,
  PgAddress,
  PG_CMD,
} from './models';
import { PgService } from './pg';
import { CustomLogger } from './common';
import { RpcService } from './rpc';
import { RedisHelperService } from './redis-helper/redis-helper.service';

@Injectable()
export class AppService extends CustomLogger {
  constructor(
    private pg: PgService,
    private rpc: RpcService,
    private redis: RedisHelperService,
  ) {
    super('AppService');
  }

  async trackAddressInBatch(
    addressStats: AddressTxStatsMsg[],
  ): Promise<boolean> {
    if (addressStats.length === 0) return true;

    const provider = this.pg.getTrxProvider();
    const trx = await provider();
    const getDbOperations = addressStats.map(addressStats =>
      this.getAddressStatsOperation(addressStats, provider),
    );
    const operations: DbOpeartion[] = await Promise.all(
      getDbOperations,
    ).catch(e => []);
    if (operations.length === 0) return false;

    const doOperations = operations.map(operation => {
      const { record, cmd } = operation;
      if (cmd === PG_CMD.create) {
        return this.pg.createAddressRecord(record, provider);
      }
      if (cmd === PG_CMD.update) {
        return this.pg.updateAddressRecord(record, provider);
      }
      return Promise.resolve(true);
    });

    const done = await Promise.all(doOperations)
      .then(results => !new Set(results).has(false))
      .catch(e => false);
    if (done) {
      operations.map(operation => {
        const { record, cmd } = operation;
        if (!cmd) return;
        this.cacheAddressStats(record);
      });
      trx.commit();
    } else {
      trx.rollback();
    }
    return done;
  }

  private async getAddressStatsOperation(
    stats: AddressTxStatsMsg,
    provider: any,
  ): Promise<DbOpeartion> {
    const { address, countTl = false, ...others } = stats;
    const promises: any[] = [];
    const getPrevRecord = this.getPrevRecord(address, provider);
    promises.push(getPrevRecord);
    if (countTl) {
      const countTlTokens = this.rpc.getAddressTlBalances(address);
      promises.push(countTlTokens);
    }
    const [prevRecord, tl_tokens] = await Promise.all(promises);

    if (!prevRecord) {
      const addressData: Partial<PgAddress> = { hash: address, ...others };
      if (tl_tokens !== undefined) {
        addressData.tl_tokens = tl_tokens;
      }
      return { record: addressData, cmd: PG_CMD.create };
    }

    const { create_at = Infinity, txs = 0, active_at = -Infinity } = prevRecord;
    const addressData: Partial<PgAddress> = {
      hash: address,
      ...others,
      tl_tokens,
    };

    if (others.create_at) {
      addressData.create_at = Math.min(create_at, others.create_at);
    }
    if (others.active_at) {
      addressData.active_at = Math.max(others.active_at, active_at);
    }
    if (others.txs) {
      addressData.txs = others.txs + +txs;
    }
    // record created by holdings tracking has no create_at field
    if (addressData.create_at === 0) {
      addressData.create_at = stats.create_at;
    }
    if (tl_tokens !== undefined) {
      addressData.tl_tokens = tl_tokens;
    }
    return { record: addressData, cmd: PG_CMD.update };
  }

  async trackAddressesHoldingsInBatch(
    msgs: AddressHoldingStatsMsg[],
  ): Promise<boolean> {
    if (msgs.length === 0) return true;

    const provider = this.pg.getTrxProvider();
    const trx = await provider();
    const getDbOperations = msgs.map(stats =>
      this.getAddressHolingsOperation(stats, provider),
    );
    const operations: DbOpeartion[] = await Promise.all(
      getDbOperations,
    ).catch(() => []);
    if (operations.length == 0) return false;

    const promises = operations.map(operation => {
      const { record, cmd } = operation;
      if (cmd === PG_CMD.create) {
        return this.pg.createAddressRecord(record, provider);
      }
      if (cmd === PG_CMD.update) {
        return this.pg.updateAddressRecord(record, provider);
      }
      return Promise.resolve(true);
    });
    const done = await Promise.all(promises)
      .then(results => !new Set(results).has(false))
      .catch(e => false);
    if (done) {
      operations.map(operation => {
        const { cmd, record } = operation;
        if (!cmd) return;
        else this.cacheAddressStats(record);
      });
      trx.commit();
    } else {
      trx.rollback();
    }
    return done;
  }

  private async getAddressHolingsOperation(
    msg: AddressHoldingStatsMsg,
    provider,
  ): Promise<DbOpeartion> {
    const { address, fusion = 0, erc20 = 0 } = msg;
    const prevRecord = await this.getPrevRecord(address, provider);

    if (!prevRecord) {
      const addressData: Partial<PgAddress> = {
        hash: address,
        fusion_tokens: fusion,
        erc20_tokens: erc20,
      };
      return { record: addressData, cmd: PG_CMD.create };
    }

    const addressData: Partial<PgAddress> = { hash: address };
    addressData.fusion_tokens = (+prevRecord.fusion_tokens || 0) + fusion;
    addressData.erc20_tokens = (+prevRecord.erc20_tokens || 0) + erc20;
    if (!erc20) delete addressData.erc20_tokens;
    if (!fusion) delete addressData.fusion_tokens;

    // no update at all
    if (Object.keys(addressData).length === 1) {
      return { record: addressData, cmd: '' };
    }

    return { record: addressData, cmd: PG_CMD.update };
  }

  async statsAddressSwaps(msg: {
    address: string;
    count: number;
  }): Promise<boolean> {
    const provider = this.pg.getTrxProvider();
    const trx = await provider();

    const { address, count } = msg;
    const prevRecord = await this.getPrevRecord(address, provider);
    const addressData: Partial<PgAddress> = { hash: address, swaps: count };

    if (prevRecord) {
      addressData.swaps += +prevRecord.swaps || 0;
      return this.pg.updateAddressRecord(addressData, provider).then(res => {
        if (res) trx.commit();
        else trx.rollback();
        this.cacheAddressStats(addressData);
        return res;
      });
    }

    return this.pg.createAddressRecord(addressData, provider).then(res => {
      if (res) trx.commit();
      else trx.rollback();
      this.cacheAddressStats(addressData);
      return res;
    });
  }

  private async getPrevRecord(
    address: string,
    provider: any,
  ): Promise<Partial<PgAddress>> {
    const statsInCache = await this.getAddressStatsInCache(address);
    if (statsInCache) return statsInCache;
    return this.pg.checkExistence(address, provider);
  }

  private async cacheAddressStats(
    addressData: Partial<PgAddress>,
  ): Promise<void> {
    const {
      create_at,
      active_at,
      txs,
      fusion_tokens,
      erc20_tokens,
      hash,
      swaps,
    } = addressData;
    const newStats: Partial<AddressStats> = {};

    if (create_at !== undefined) newStats.create_at = create_at;
    if (active_at !== undefined) newStats.active_at = active_at;
    if (txs !== undefined) newStats.txs = txs;
    if (fusion_tokens !== undefined) newStats.fusion_tokens = fusion_tokens;
    if (erc20_tokens !== undefined) newStats.erc20_tokens = erc20_tokens;
    if (swaps !== undefined) newStats.swaps = swaps;

    const address = hash.trim();
    const key = this.getAddressStatsKey(address);
    const prevStats = await this.getAddressStatsInCache(address);
    const stats: Partial<AddressStats> = { ...prevStats, ...newStats };
    // 13 * 10, cache for 200 blocks in case user who likes checking address frequently
    this.redis.cacheValue(key, JSON.stringify(stats), 13 * 200);
  }

  private getAddressStatsInCache(
    addressHash: string,
  ): Promise<Partial<AddressStats>> {
    const address = addressHash.trim();
    const key = this.getAddressStatsKey(address);
    return this.redis
      .getCachedValue(key)
      .then(val => JSON.parse(val))
      .then(stats => {
        if (Object.keys(stats).length) return stats;
        else return null;
      })
      .catch(e => null);
  }

  // keep stats in this format, may extract it stats to a single service if traffic grows
  private getAddressStatsKey(address: string) {
    return `address:${address}:stats`;
  }
}
