import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { ConfigModule } from '@nestjs/config';
import { PgConfig } from './pg.config';
import { PgService } from './pg.service';
import { PgTokenStatsService } from './pg-token-stats.service';
import { PgTokensService } from './pg-tokens.service';

@Module({
  imports: [
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      useClass: PgConfig,
    }),
  ],
  providers: [PgService, PgTokenStatsService, PgTokensService],
  exports: [PgService, PgTokenStatsService, PgTokensService],
})
export class PgModule {}
