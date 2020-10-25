import { Module } from '@nestjs/common';
import { TxProcessorService } from './tx-processor.service';
import { AssetChangeService } from './asset-change.service';
import { GenAssetService } from './gen-asset.service';
import { GenNotationService } from './gen-notation.service';
import { SendAssetService } from './send-asset.service';
import { SwapService } from './swap.service';
import { OriginService } from './origin.service';
import { UnknownService } from './unknown.service';
import { TimelockAssetService } from './timelock-asset.service';
import { Erc20Service } from './erc20.service';
import { WorkerClientModule } from '../worker-client/worker-client.module';
import { MbtcService } from './mbtc.service';
import { ContractCreateService } from './contract-create.service';
import { PgModule, PgService } from '../pg';
import { TxHelperModule, TxHelperService } from './tx-helper';
import { Web3Module } from './tx-helper/web3';

@Module({
  imports: [TxHelperModule, WorkerClientModule, PgModule, Web3Module],
  providers: [
    SendAssetService,
    GenNotationService,
    GenAssetService,
    AssetChangeService,
    SwapService,
    OriginService,
    UnknownService,
    Erc20Service,
    TxProcessorService,
    TimelockAssetService,
    SendAssetService,
    MbtcService,
    ContractCreateService,
    PgService,
    TxHelperService,
  ],
  exports: [
    TxProcessorService,
    GenNotationService,
    GenAssetService,
    AssetChangeService,
    SwapService,
    OriginService,
    UnknownService,
    Erc20Service,
    TxProcessorService,
    TimelockAssetService,
    SendAssetService,
    MbtcService,
    ContractCreateService,
    PgService,
    TxHelperService,
  ],
})
export class TxProcessorModule {}
