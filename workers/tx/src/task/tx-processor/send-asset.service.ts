import { Injectable } from '@nestjs/common';
import { RawTx, TxAssetsAndData, TxAssetData } from '../../models';
import { TxHelperService } from './tx-helper';

@Injectable()
export class SendAssetService {
  async getTxsTokensAndData(
    rawTx: RawTx,
    helper: TxHelperService,
  ): Promise<TxAssetsAndData<TxAssetData>> {
    if (!rawTx.log) {
      return { data: null, tokens: [] };
    }
    const { AssetID, Value } = rawTx.log;
    const snapshot = await helper.getTokenSnapshot(AssetID);
    if (!snapshot) {
      console.log(AssetID);
      process.exit();
    }
    const { symbol, precision } = snapshot;
    const value = +Value / Math.pow(10, precision);

    const data = { symbol, value, token: AssetID };
    const tokens = [AssetID];

    return { data, tokens };
  }
}
