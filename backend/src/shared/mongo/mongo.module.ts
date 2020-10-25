import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfig } from './mongo.config';
import transactionSchema from './transaction.schema';
import { MongoService } from './mongo.service';
import blockSchema from './block.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MongoConfig,
    }),
    MongooseModule.forFeature([
      { schema: transactionSchema, name: 'Transactions' },
      { schema: blockSchema, name: 'Blocks' },
    ]),
  ],
  providers: [MongoService],
  exports: [MongoService],
})
export class MongoModule {}
