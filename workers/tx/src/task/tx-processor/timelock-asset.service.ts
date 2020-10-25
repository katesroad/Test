import { Injectable } from '@nestjs/common';
import { RawTx, TimeLockTxsData, TxAssetsAndData } from '../../models';
import { TxHelperService } from './tx-helper';

@Injectable()
export class TimelockAssetService {
  async getTxsTokensAndData(
    rawTx: RawTx,
    helper: TxHelperService,
  ): Promise<TxAssetsAndData<TimeLockTxsData>> {
    if (!rawTx.log) return { tokens: [], data: null };
    const { log } = rawTx;

    const { AssetID, Value, StartTime, EndTime, LockType } = log;
    const { symbol, precision } = await helper.getTokenSnapshot(AssetID);
    const value = +Value / Math.pow(10, precision);

    const data = {
      value,
      token: AssetID,
      symbol,
      startTime: StartTime,
      endTime: EndTime,
      type: LockType,
    };

    const tokens = [rawTx.log.AssetID];

    return { data, tokens };
  }
}
