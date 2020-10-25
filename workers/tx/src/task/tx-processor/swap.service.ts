import { Injectable } from '@nestjs/common';
import { RawTx, TxAssetsAndData } from '../../models';
import { PgService } from '../pg';
import { WorkerClientService } from '../worker-client';
import { TxHelperService } from './tx-helper';

@Injectable()
export class SwapService {
  constructor(
    private workerClient: WorkerClientService,
    private pg: PgService,
    private helper: TxHelperService,
  ) {}

  async getTxsTokensAndData(
    rawTx: RawTx,
  ): Promise<TxAssetsAndData<{ swap: string }>> {
    const { type, log, timestamp, from } = rawTx;
    if (!log) return { data: null, tokens: [] };
    const { SwapID, FromAssetID, ToAssetID, Deleted } = log;

    const provider = this.pg.getTrxProvider();
    const trx = await provider();
    let trackRes = false;

    const swap: any = { hash: SwapID };
    let tokens: string[];
    let owner: string;

    if (type.indexOf('Take') > -1 || type.indexOf('Recall') > -1) {
      const swapData = await this.getSwap(SwapID, provider);
      const { FromAssetID, ToAssetID } = swapData;
      if (swapData.owner) owner = swapData.owner;
      if (type.indexOf('Recall') !== -1 || Deleted === 'true') {
        swap.deleted_at = timestamp;
      }
      tokens = Array.from(new Set([...FromAssetID, ...ToAssetID]));
    }

    if (type === 'MakeMultiSwapFunc') {
      tokens = Array.from(new Set([...FromAssetID, ...ToAssetID]));
      swap.from_tokens = JSON.stringify(FromAssetID);
      swap.to_tokens = JSON.stringify(ToAssetID);
      swap.create_at = timestamp;
      const fromAssetSymbol = await Promise.all(
        FromAssetID.map(token => this.getTokenSymbol(token)),
      );
      log.fromAssetSymbol = fromAssetSymbol;
      const toAssetSymbol = await Promise.all(
        ToAssetID.map(token => this.getTokenSymbol(token)),
      );
      log.toAssetSymbol = toAssetSymbol;
      swap.data = JSON.stringify(log);
      swap.owner = from;
      swap.create_at = timestamp;
      owner = from;
    }
    if (type === 'MakeSwapFuncExt' || type === 'MakeSwapFunc') {
      tokens = Array.from(new Set([FromAssetID, ToAssetID]));
      swap.from_tokens = JSON.stringify([FromAssetID]);
      swap.to_tokens = JSON.stringify([ToAssetID]);
      const getFromTokenSymbol = this.getTokenSymbol(FromAssetID);
      const getToTokenSymbol = this.getTokenSymbol(ToAssetID);
      const [fromAssetSymbol, toAssetSymbol] = await Promise.all([
        getFromTokenSymbol,
        getToTokenSymbol,
      ]);
      log.fromAssetSymbol = fromAssetSymbol;
      log.toAssetSymbol = toAssetSymbol;
      swap.data = JSON.stringify(log);
      swap.owner = from;
      swap.create_at = timestamp;
      owner = from;
    }

    if (swap.deleted_at || swap.create_at) {
      trackRes = await this.trackSwap(swap, provider);
      if (trackRes) trx.commit();
      else {
        console.error(`track swap failed, retrying...`);
        trackRes = await this.trackSwap(swap, provider);
        if (trackRes)
          try {
            trx.commit();
          } catch {}
        else {
          try {
            trx.commit();
            console.error(`retry tracking swap is failed...`);
          } catch {}
        }
      }
    } else {
      try {
        trx.rollback();
      } catch {}
    }
    if (swap.deleted_at && owner) {
      this.workerClient.notifyAddressSwapsChange({ address: owner, count: -1 });
    }
    if (swap.create_at) {
      this.workerClient.notifyAddressSwapsChange({ address: owner, count: 1 });
    }

    const data = { swap: SwapID };

    return { data, tokens };
  }

  private getSwap(swap: string, provider) {
    return this.pg.getSwap(swap, provider);
  }

  private trackSwap(swapData: any, provider: any): Promise<boolean> {
    return this.pg.trackSwap(swapData, provider);
  }

  private getTokenSymbol(token: string): Promise<string> {
    return this.helper
      .getTokenSnapshot(token)
      .then(snapshot => snapshot.symbol)
      .catch(() => '');
  }
}
