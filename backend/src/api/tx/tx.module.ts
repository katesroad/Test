import { Module } from '@nestjs/common';
import { TxController } from './tx.controller';
import { TxService } from './tx.service';
import { MongoModule } from '../../shared/mongo';

@Module({
  imports: [MongoModule],
  controllers: [TxController],
  providers: [TxService],
})
export class TxModule {}
