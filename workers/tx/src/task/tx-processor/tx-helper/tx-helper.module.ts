import { Module } from '@nestjs/common';
import { Web3Service, Web3Module } from './web3';
import { FusionTokenService } from './fusion-token.service';
import { TxHelperService } from './tx-helper.service';

@Module({
  imports: [Web3Module],
  providers: [TxHelperService, FusionTokenService, Web3Service],
  exports: [TxHelperService, FusionTokenService, Web3Service],
})
export class TxHelperModule {}
