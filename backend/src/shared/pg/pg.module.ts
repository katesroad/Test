import { Module, Global } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { ConfigModule } from '@nestjs/config';
import { PgConfig } from './pg.config';

import { PgTxsService } from './pg-txs.service';
import { PgSwapsService } from './pg-swaps.service';
import { PgTokenService } from './pg-token.service';
import { PgAddressService } from './pg-address.service';
import { PgStatsService } from './pg-stats.service';
import { HelperService } from './helper.service';

@Global()
@Module({
  imports: [
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      useClass: PgConfig,
    }),
  ],
  providers: [
    PgTxsService,
    PgTokenService,
    PgAddressService,
    PgStatsService,
    HelperService,
    PgSwapsService,
  ],
  exports: [
    PgTxsService,
    PgTokenService,
    PgAddressService,
    PgStatsService,
    PgSwapsService,
  ],
})
export class PgModule {}
