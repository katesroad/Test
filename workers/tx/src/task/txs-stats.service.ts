import { Injectable } from '@nestjs/common';
import { RedisHelperService, HelperService, NetworkService } from '../helper';
import { StatsTxsService } from './mongo/stats-txs.service';
import { PgTxsStatsService } from './pg/pg-txs-stats.service';

@Injectable()
export class TxsStatsService {
  private upToDate: boolean = false;

  constructor(
    private redis: RedisHelperService,
    private statsTxs: StatsTxsService,
    private pgTxsStats: PgTxsStatsService,
    private helper: HelperService,
    private network: NetworkService,
  ) {}

  private async onApplicationBootstrap(): Promise<any> {
    await this.helper.sleep(14000);
    const statsTrackAt = await this.getTxsStatsInitialTrackAt();
    this.setTxsStatsPrevTrackAt(statsTrackAt);
    // this.trackTxsStats();
  }

  async trackTxsStats(): Promise<void> {
    const range = await this.getTxsStatsRange();
    let networkTime = await this.network.getNetworkTimestamp();

    if (range.$lte > networkTime) {
      this.helper.logInfoMsg(`Catched up latest network time.`);
      this.upToDate = true;
      return;
    }

    this.helper.verbose({
      ...range,
      networkTime,
    });

    const statsData = await this.statsTxs.getTxsStatsForRange(range);
    const { stats_at } = statsData;
    const statsIsSaved = await this.pgTxsStats.saveTxsStats(statsData);
    if (statsIsSaved) {
      this.helper.logInfoMsg(` stats for range: ${range.$gt}~${range.$lte}`);
      this.setTxsStatsPrevTrackAt(stats_at);
    } else {
      this.helper.logErrorMsg(`Failed to save stats to PostgreSQL`);
      this.helper.logErrorMsg(`Retrying make txs stats...`);
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
    let trackAt = await this.pgTxsStats.getTxStatsTrackStartTime();
    if (!trackAt) trackAt = await this.statsTxs.getTxStatsTrackStartTime();

    this.helper.logInfoMsg(`Txs stats tracking start at timestamp:${trackAt}`);

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
