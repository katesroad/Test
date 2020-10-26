import { Injectable } from '@nestjs/common';
import { RedisHelperService } from './redis-helper.service';
import { IStakingStats, INetworkSummary, IPagedBlock } from '../../models';
import { RpcHelperService } from './rpc-helper.service';
import { CustomLogger } from '../../common';
import { MongoService } from '../mongo';

@Injectable()
export class HelperService extends CustomLogger {
  constructor(
    private redis: RedisHelperService,
    private rpc: RpcHelperService,
    private mongo: MongoService,
  ) {
    super('Server:HelperService');
  }

  setTxCount(count: { erc20: number; txs: number }): void {
    console.log(count);
    this.redis.cacheValue('tx:count', JSON.stringify(count));
  }

  getTxCount(): Promise<any> {
    return this.redis
      .getCachedValue('tx:count')
      .then(val => JSON.parse(val))
      .catch(() => -1);
  }

  setTxDecodingProgress(block: number): void {
    this.redis.cacheValue('tx:progress', JSON.stringify(block));
  }

  getTxDecodingProgress(): Promise<number> {
    return this.redis
      .getCachedValue('tx:progress')
      .then(val => +val)
      .catch(() => -1);
  }

  updateNetworkState(number: any): void {
    this.setNetworkHeight(number);
    this.mongo.getBlocktime(number).then(time => this.setBlockTime(time));
    this.rpc.getStakingStats().then(stats => this.storeStakingStats(stats));
  }

  private setNetworkHeight(height: number): void {
    this.redis.cacheValue('network:height', JSON.stringify(height));
  }

  getNetworkHeight(): Promise<number> {
    return this.redis.getCachedValue('network:height').then(val => +val);
  }

  setBlockTime(blocktime: number) {
    this.redis.cacheValue('network:blocktime', JSON.stringify(blocktime));
  }

  getBlockTime(): Promise<number> {
    return this.redis
      .getCachedValue('network:timestamp')
      .then(val => +val || 13)
      .catch(e => 13);
  }

  getTokenSupply(height: number) {
    // token burn
    let supply = 56824880.1487;
    const rangeLength = 4915200;
    // https://github.com/ernyx/fsn-miner-stats/src/readBlocks.js#L1258
    const stage = Math.ceil(height / rangeLength);
    for (let i = 0; i < stage; i++) {
      supply += Math.pow(0.5, i) * 2.5 * (height - i * rangeLength);
    }
    return supply;
  }

  private storeStakingStats(info: IStakingStats): void {
    this.redis.cacheValue('network:staking', JSON.stringify(info));
  }

  getStakingStats(): Promise<IStakingStats> {
    return this.redis
      .getCachedValue('network:staking')
      .then(data => JSON.parse(data) || {})
      .catch(() => ({}));
  }

  async getNetworkSummary(): Promise<INetworkSummary> {
    const getBlockTime = this.getBlockTime();
    const getStakingStats = this.getStakingStats();
    const getDecodingProgress = this.getTxDecodingProgress();
    const getNetworkHeight = this.getNetworkHeight();

    return Promise.all([
      getBlockTime,
      getNetworkHeight,
      getStakingStats,
      getDecodingProgress,
    ]).then(data => {
      const [blocktime, height, stats, progress] = data;
      const staked = stats.tickets * 5000;
      const supply = this.getTokenSupply(height);
      return { ...stats, height, blocktime, staked, supply, progress };
    });
  }

  getBlockData(blockData: any): IPagedBlock {
    const { miner, timestamp, number, transactions = [] } = blockData;
    const block = {
      height: number,
      miner: miner.toLowerCase(),
      timestamp,
      reward: 2.5,
      txs: transactions.length,
    };
    return block;
  }

  getBlockReward(): Promise<number> {
    return this.rpc.getBlockReward();
  }
}
