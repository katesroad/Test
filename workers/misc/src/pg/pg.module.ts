import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { ConfigModule } from '@nestjs/config';
import { PgConfig } from './pg.config';
import { PgService } from './pg.service';

@Module({
  imports: [
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      useClass: PgConfig,
    }),
  ],
  providers: [PgService],
  exports: [PgService],
})
export class PgModule {}
