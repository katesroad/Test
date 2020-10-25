import { Injectable } from '@nestjs/common';
import { RedisHelperService, HelperService } from '../helper';
import { MongoService } from './mongo/mongo.service';
import { PgService } from './pg';
import { CustomLogger } from '../common';

@Injectable()
export class TxsStatsService extends CustomLogger {
  private upToDate: boolean = false;

  constructor(
    private redis: RedisHelperService,
    private mongo: MongoService,
    private pg: PgService,
    private helper: HelperService,
  ) {
    super('TxsStatsService');
  }

  private async onApplicationBootstrap(): Promise<any> {
    await this.helper.sleep(14000);
    const statsTrackAt = await this.getTxsStatsInitialTrackAt();
    this.setTxsStatsPrevTrackAt(statsTrackAt);
    // this.trackTxsStats();
  }

  async trackTxsStats(): Promise<void> {
    const range = await this.getTxsStatsRange();
    let networkTime = await this.helper.getNetworkTimestamp();

    if (range.$lte > networkTime) {
      this.logInfoMsg(`Catched up latest network time.`);
      this.upToDate = true;
      return;
    }

    this.logger.verbose({
      ...range,
      networkTime,
    });

    const statsData = await this.mongo.getTxsStatsForRange(range);
    const { stats_at } = statsData;
    const statsIsSaved = await this.pg.saveTxsStats(statsData);
    if (statsIsSaved) {
      this.logInfoMsg(` stats for range: ${range.$gt}~${range.$lte}`);
      this.setTxsStatsPrevTrackAt(stats_at);
    } else {
      this.logErrorMsg(`Failed to save stats to PostgreSQL`);
      this.logErrorMsg(`Retrying make txs stats...`);
    }

    this.trackTxsStats();
  }

  async getTxsStatsPrevTrackAt(): Promise<number> {
    const statsAtKey = this.getStatsAtKey();
    const statsAt = await this.redis
      .getCachedValue(statsAtKey)
      .then(val => +val);
    if (statsAt) return statsAt;
    return this.getTxsStatsPrevTrackAt();
  }

  isUpToDate(): boolean {
    return this.upToDate;
  }

  private setTxsStatsPrevTrackAt(timestamp: number): void {
    const statsAtKey = this.getStatsAtKey();
    this.redis.cacheValue(statsAtKey, timestamp);
  }

  private async getTxsStatsInitialTrackAt(): Promise<number> {
    let trackAt = await this.pg.getTxStatsTrackStartTime();
    if (!trackAt) trackAt = await this.mongo.getTxStatsTrackStartTime();

    this.logInfoMsg(`Txs stats tracking start at timestamp:${trackAt}`);

    return +trackAt;
  }

  private async getTxsStatsRange(): Promise<{ $lte: number; $gt: number }> {
    const ONE_DAY = 86400;
    const $gt = await this.getTxsStatsPrevTrackAt();
    const $lte = ONE_DAY + $gt;
    return { $gt, $lte };
  }

  private getStatsAtKey(): string {
    return 'txStatsAt';
  }
}
