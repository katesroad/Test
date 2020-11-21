import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { ConfigModule } from '@nestjs/config';
import { PgConfig } from './pg.config';
import { PgService } from './pg.service';
import { PgTxsService } from './pg-txs.service';
import { PgTokenService } from './pg-token.service';
import { PgSwapService } from './pg-swap.service';
import { PgTxsStatsService } from './pg-txs-stats.service';

@Module({
  imports: [
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      useClass: PgConfig,
    }),
  ],
  providers: [
    PgService,
    PgTxsService,
    PgTokenService,
    PgSwapService,
    PgTxsStatsService,
  ],
  exports: [
    PgService,
    PgTxsService,
    PgTokenService,
    PgSwapService,
    PgTxsStatsService,
  ],
})
export class PgModule {}
