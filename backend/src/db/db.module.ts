import { Module } from '@nestjs/common';
import { PgModule } from './pg/pg.module';

@Module({
  imports: [PgModule],
})
export class DbModule {}
