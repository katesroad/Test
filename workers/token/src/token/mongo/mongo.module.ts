import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfig } from './mongo.config';
import schema from './transaction.schema';
import { MongoService } from './mongo.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MongoConfig,
    }),
    MongooseModule.forFeature([{ schema, name: 'Transactions' }]),
  ],
  providers: [MongoService],
  exports: [MongoService],
})
export class MongoModule {}
