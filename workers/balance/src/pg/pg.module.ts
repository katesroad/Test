import { Module } from '@nestjs/common';
import { KnexModule } from 'nestjs-knex';
import { ConfigModule } from '@nestjs/config';
import { PgConfig } from './pg.config';
import { PgService } from './pg.service';
import { PgErc20BalanceService } from './pg-erc20-balance.service';
import { PgAssetBalanceService } from './pg-asset-balance.service';

@Module({
  imports: [
    KnexModule.forRootAsync({
      imports: [ConfigModule],
      useClass: PgConfig,
    }),
  ],
  providers: [PgService, PgErc20BalanceService, PgAssetBalanceService],
  exports: [PgService, PgErc20BalanceService, PgAssetBalanceService],
})
export class PgModule {}
