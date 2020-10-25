import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TxProcessorModule } from './tx-processor/tx-processor.module';
import { TxProcessorService } from './tx-processor/tx-processor.service';
import { PgModule } from './pg/pg.module';
import { PgService } from './pg/pg.service';
import { MongoModule } from './mongo/mongo.module';
import { WorkerClientModule } from './worker-client/worker-client.module';
import { WorkerClientService } from './worker-client/worker-client.service';
import { NotificationService } from './notification-service';
import { TxsStatsService } from './txs-stats.service';
import { TxsTrackService } from './txs-track.service';

@Module({
  imports: [
    TxProcessorModule,
    PgModule,
    MongoModule,
    WorkerClientModule,
    MongoModule,
  ],
  providers: [
    TaskService,
    PgService,
    TxProcessorService,
    NotificationService,
    WorkerClientService,
    TxsStatsService,
    TxsTrackService,
  ],
  exports: [TaskService],
})
export class TaskModule {}
