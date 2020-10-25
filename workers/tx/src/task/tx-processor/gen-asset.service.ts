import { Injectable } from '@nestjs/common';
import { RawTx, TokenData, TxAssetData, TxAssetsAndData } from '../../models';
import { PgService } from '../pg';

@Injectable()
export class GenAssetService {
  constructor(private pg: PgService) {}
  async getTxsTokensAndData(
    rawTx: RawTx,
  ): Promise<TxAssetsAndData<TxAssetData>> {
    const { log, hash, timestamp, from } = rawTx;
    if (!log) return { data: null, tokens: [] };

    const {
      AssetID,
      Total,
      Symbol,
      Decimals,
      Name,
      Canchange,
      Description,
    } = log;
    const value = +Total / Math.pow(10, Decimals);

    let info: any;
    try {
      const desc = JSON.parse(Description);
      if (Object.keys(desc).length !== 0) info = desc;
    } catch {
      if (Description) info = { desc: Description };
    }

    const token: TokenData = {
      hash: AssetID as string,
      name: Name as string,
      symbol: Symbol as string,
      qty: Math.pow(Total, Decimals) as number,
      precision: Decimals as number,
      issuer: from as string,
      create_at: timestamp as number,
      active_at: timestamp as number,
      issue_tx: hash as string,
      canchange: Canchange as boolean,
      token_type: 0,
    };
    if (info) {
      token.info = JSON.stringify(info);
    }

    // add this dirty code as I want to create a table token_tx
    // which references token.hash as forign key
    await this.pg.saveTokenInfo(token);

    const data = { token: AssetID, symbol: Symbol, value };
    const tokens = [AssetID];

    return { data, tokens };
  }
}
