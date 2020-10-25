import { Module } from '@nestjs/common';
import { BlockModule } from './block/block.module';
import { TxModule } from './tx/tx.module';
import { AddressModule } from './address/address.module';
import { TokenModule } from './token/token.module';
import { NetworkModule } from './network/network.module';
import { StatsModule } from './stats/stats.module';
import { SwapModule } from './swap/swap.module';
import { AnyswapModule } from './anyswap/anyswap.module';

@Module({
  imports: [
    BlockModule,
    TxModule,
    AddressModule,
    TokenModule,
    StatsModule,
    NetworkModule,
    SwapModule,
    AnyswapModule,
  ],
})
export class ApiModule {}
