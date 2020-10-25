import { Module } from '@nestjs/common';
import { BlockController } from './block.controller';
import { BlockService } from './block.service';
import { MongoModule } from '../../shared/mongo';

@Module({
  imports: [MongoModule],
  controllers: [BlockController],
  providers: [BlockService],
})
export class BlockModule {}
