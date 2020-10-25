import { Injectable } from '@nestjs/common';
import { RawTx, AssetChangeTxData, TxAssetsAndData } from '../../models';
import { TxHelperService } from './tx-helper';

@Injectable()
export class AssetChangeService {
  async getTxsTokensAndData(
    rawTx: RawTx,
    helper: TxHelperService,
  ): Promise<TxAssetsAndData<AssetChangeTxData>> {
    const { IsInc, AssetID, Value } = rawTx.log;
    const snapshot = await helper.getTokenSnapshot(AssetID);
    const { symbol, precision } = snapshot;
    const value = Value / Math.pow(10, precision);

    const data = { isInc: IsInc, token: AssetID, symbol, value };
    const tokens = [AssetID];

    return { data, tokens };
  }
}
