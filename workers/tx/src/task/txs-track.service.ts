import { Injectable } from '@nestjs/common';
import { PgService } from './pg';
import { TxProcessorService } from './tx-processor';
import { MongoService } from './mongo/mongo.service';
import { CustomLogger } from '../common';
import { ProcessedTx, TxsRange } from '../models';
import { RedisHelperService, HelperService } from '../helper';
import { WorkerClientService } from './worker-client';
import { NotificationService } from './notification-service';

@Injectable()
export class TxsTrackService extends CustomLogger {
  private step = 10;
  private density = 10;
  private catchUp = false;
  private cost = 0;
  private size = 0;

  constructor(
    private pg: PgService,
    private mongo: MongoService,
    private processor: TxProcessorService,
    private redis: RedisHelperService,
    private workerClient: WorkerClientService,
    private notificationService: NotificationService,
    private helper: HelperService,
  ) {
    super('TxsTrackService');
  }

  private async onApplicationBootstrap(): Promise<any> {
    this.logInfoMsg(`Is waiting latest network cached in Redis...`);
    await this.helper.sleep(13000);
    const trackAt = await this.getTxInitialTrackAt();
    this.setTxPrevTrackAt(trackAt);
    this.trackTxs();
  }

  async trackTxs(): Promise<void> {
    const startAt = Date.now();
    const range = await this.getTxsTrackRange();

    let networkHeight = await this.helper.getNetworkHeight();
    this.logger.verbose({
      range,
      step: this.step,
      prevSize: this.size,
      density: this.density,
      latency: networkHeight - range.$lte,
      catchUp: this.catchUp,
      cost: this.cost,
      networkHeight,
    });

    let state: any = null;
    if (this.catchUp) {
      const { height, txs } = await this.helper.getNetworkState();
      state = { height, txs };
    }
    const { rawTxs, syncHeight } = await this.mongo.getRawTxsForRange(
      range,
      state,
    );
    this.density = rawTxs.length / (range.$lte - range.$gt);

    const txs: ProcessedTx[] = await this.processor.processTxs(rawTxs);
    let prevTrackAt: number;
    this.size = txs.length;

    this.workerClient.notifyTxDecodingProgress({ block: range.$lte });
    if (txs.length) {
      this.workerClient.notifyL6Txs(txs);
      const pgSavedResult = await this.pg.saveProcessedTxs(txs);
      const { txsIsSaved, txsCount } = pgSavedResult;
      if (txsIsSaved) {
        this.workerClient.notifyBalancesChangeByTxs(txs);
        prevTrackAt = syncHeight;
        await this.notificationService.makeStatsForTxs(txs);
        this.workerClient.notifyTxStats({ txs: txsCount });
      } else {
        this.logErrorMsg(`Failed to save txs to pg.`);
        this.logErrorMsg(`Will retry this range`);
        this.logErrorMsg(`Retrying...`);
        return this.trackTxs();
      }
    } else {
      prevTrackAt = syncHeight;
      this.density = 0;
    }

    if (this.catchUp) {
      this.logInfoMsg(`Is waiting next block ...`);
      await this.helper.sleep(1300 * 5);
    } else {
      let sleep = txs.length * 12;
      sleep = Math.max(100, sleep);
      sleep = Math.min(2500, sleep);
      this.logInfoMsg(`wait ${sleep} ms to avoid rabbitMQ congestion`);
      if (txs.length) {
        await this.helper.sleep(sleep);
      }
    }

    this.setTxPrevTrackAt(prevTrackAt);
    this.cost = Date.now() - startAt;

    this.trackTxs();
  }

  async getTxPrevTrackAt(): Promise<number> {
    const trackAtKey = this.getTrackAtKey();
    const trackAt = await this.redis
      .getCachedValue(trackAtKey)
      .then(val => +val);
    if (trackAt) return +trackAt;
    return this.getTxInitialTrackAt().then(trackAt => +trackAt);
  }

  private setTxPrevTrackAt(height: number): void {
    this.logInfoMsg(`Set track at ${height}`);
    const trackAtKey = this.getTrackAtKey();
    this.redis.cacheValue(trackAtKey, height);
  }

  private async getTxsTrackRange(): Promise<TxsRange> {
    let $gt = await this.getTxPrevTrackAt();
    // no data in this range on mainnet
    if ($gt > 739490 && $gt <= 786009) {
      $gt = 786009;
    }
    if (this.density >= 75) this.step = 1;
    else if (this.density >= 50) this.step = 2;
    else if (this.density >= 25) this.step = 4;
    else if (this.density >= 1) this.step = 10;
    else this.step = Math.floor(Math.random() * 10 + 5);
    if ($gt >= 2300000) this.step = Math.min(10, this.step);
    const { height } = await this.helper.getNetworkState();
    let $lte = Math.min(height, $gt + this.step);
    if ($lte === (+height as number)) {
      this.catchUp = true;
      return { $gt: +$gt, $lte: $lte };
    }
    return { $gt: +$gt, $lte };
  }

  private async getTxInitialTrackAt(): Promise<number> {
    const trackAtKey = this.getTrackAtKey();
    let trackAt: number = await this.pg.getTxTrackStartHeight();
    if (!trackAt) trackAt = await this.mongo.getTxTrackStartHeight();
    if (trackAt) this.redis.cacheValue(trackAtKey, trackAt);
    return trackAt;
  }

  private getTrackAtKey(): string {
    return 'tx:track';
  }
}
