import { Injectable } from '@nestjs/common';
import { RawTx, TxAssetsAndData } from '../../models';

@Injectable()
export class GenNotationService {
  async getTxsAssetsAndData(
    rawTx: RawTx,
  ): Promise<TxAssetsAndData<{ usan: number }>> {
    let data: any;
    if (!rawTx.log) data = null;
    else data = { usan: rawTx.log.notation };
    return { data, tokens: [] };
  }
}
