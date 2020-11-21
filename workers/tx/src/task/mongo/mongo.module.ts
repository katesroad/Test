import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfig } from './mongo.config';
import transactionSchema from './transaction.schema';
import { ReadTxsService } from './read-txs.service';
import { StatsTxsService } from './stats-txs.service';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MongoConfig,
    }),
    MongooseModule.forFeature([
      { schema: transactionSchema, name: 'Transactions' },
    ]),
  ],
  providers: [ReadTxsService, StatsTxsService],
  exports: [ReadTxsService, StatsTxsService],
})
export class MongoModule {}
