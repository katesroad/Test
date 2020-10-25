import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoConfig } from './mongo.config';
import { MongoService } from './mongo.service';
import schema from './block.schema';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: MongoConfig,
    }),
    MongooseModule.forFeature([{ name: 'Blocks', schema }]),
  ],
  providers: [MongoService],
  exports: [MongoService],
})
export class MongoModule {}
