import { Injectable } from '@nestjs/common';
import { RawTx, TxAssetData, TxAssetsAndData } from '../../models';
import { TxHelperService } from './tx-helper';

@Injectable()
export class MbtcService {
  async getTxsTokensAndData(
    rawTx: RawTx,
    helper: TxHelperService,
  ): Promise<TxAssetsAndData<TxAssetData>> {
    const { log } = rawTx;
    if (!log) return { tokens: [], data: null };

    const { erc20, value } = rawTx.erc20Receipts[0];
    const tokenSnapshot = await helper.getTokenSnapshot(erc20);
    const { symbol, precision } = tokenSnapshot;
    const qty = +value / Math.pow(10, precision);

    const data = { token: erc20, symbol, value: qty };
    const tokens = [erc20];

    return { data, tokens };
  }
}
