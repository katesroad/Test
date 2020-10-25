import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfig } from './mongo.config';
import transactionSchema from './transaction.schema';
import { MongoService } from './mongo.service';

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
  providers: [MongoService],
  exports: [MongoService],
})
export class MongoModule {}
