import { Injectable } from '@nestjs/common';
import { TxProcessor } from './tx-processor';
import { RawTx, TxAssetsAndData } from '../../models';
import { WorkerClientService } from '../worker-client';
import { TxHelperService } from './tx-helper';

@Injectable()
export class UnknownService {
  constructor(private workerClient: WorkerClientService) {}

  async getTxsAssetsAndData(
    rawTx: RawTx,
    tokenService: TxHelperService,
  ): Promise<TxAssetsAndData<any>> {
    console.log(rawTx.type, rawTx.hash);
    return TxProcessor.getTxsTokensAndDataForUnknowTx(
      rawTx,
      tokenService,
      this.workerClient,
    );
  }
}
