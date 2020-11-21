import { Injectable } from '@nestjs/common';
import { SendAssetService } from './send-asset.service';
import { TimelockAssetService } from './timelock-asset.service';
import { ProcessedTx, RawTx, TxAssetsAndData } from '../../models';
import { GenAssetService } from './gen-asset.service';
import { AssetChangeService } from './asset-change.service';
import { GenNotationService } from './gen-notation.service';
import { SwapService } from './swap.service';
import { OriginService } from './origin.service';
import { TxHelperService } from './tx-helper';
import { UnknownService } from './unknown.service';
import { Erc20Service } from './erc20.service';
import { TxProcessor } from './tx-processor';
import { MbtcService } from './mbtc.service';
import { ContractCreateService } from './contract-create.service';
import { HelperService } from '../../helper';
import { TRANSACTION_TYPES } from '../../common';

@Injectable()
export class TxProcessorService {
  constructor(
    private sendAsset: SendAssetService,
    private timelock: TimelockAssetService,
    private genAsset: GenAssetService,
    private assetChange: AssetChangeService,
    private genNotation: GenNotationService,
    private swap: SwapService,
    private origin: OriginService,
    private unknown: UnknownService,
    private erc20: Erc20Service,
    private mbtc: MbtcService,
    private contractCreate: ContractCreateService,
    private txHelper: TxHelperService,
    private helper: HelperService
  ) {
  }

  async processTxs(rawTxs: RawTx[]): Promise<ProcessedTx[]> {
    const startAt = Date.now();

    const promises = rawTxs.map(rawTx => this.processTx(rawTx));
    const processedTxs = await Promise.all(promises);
    const txs = processedTxs.filter(
      tx => tx.type !== TRANSACTION_TYPES['Approval'].id,
    ); // don't save approval type to database

    const cost = Date.now() - startAt;
    this.helper.logInfoMsg(`Processed ${txs.length} txs, Cost ${cost} ms.`);

    return this.sortTxs(txs);
  }

  private async processTx(rawTx: RawTx): Promise<ProcessedTx> {
    const { tokens = [], data = null } = await this.getTxsTokensAndData(rawTx);
    const tx: ProcessedTx = TxProcessor.cleanTx(rawTx);
    if (tokens.length) tx.tokens = tokens;
    if (data) tx.data = data;
    return tx;
  }

  private async getTxsTokensAndData(
    rawTx: RawTx,
  ): Promise<TxAssetsAndData<any>> {
    const { type } = rawTx;
    switch (type) {
      case 'SendAssetFunc':
        return this.sendAsset.getTxsTokensAndData(rawTx, this.txHelper);
      case 'TimeLockFunc':
        return this.timelock.getTxsTokensAndData(rawTx, this.txHelper);
      case 'GenAssetFunc':
        return this.genAsset.getTxsTokensAndData(rawTx);
      case 'AssetValueChangeFunc':
      case 'OldAssetValueChangeFunc':
        return this.assetChange.getTxsTokensAndData(rawTx, this.txHelper);
      case 'GenNotationFunc':
        return this.genNotation.getTxsAssetsAndData(rawTx);
      case 'MakeSwapFunc':
      case 'RecallSwapFunc':
      case 'TakeSwapFunc':
      case 'MakeSwapFuncExt':
      case 'TakeSwapFuncExt':
      case 'MakeMultiSwapFunc':
      case 'RecallMultiSwapFunc':
      case 'TakeMultiSwapFunc':
        return this.swap.getTxsTokensAndData(rawTx);
      case 'ERC20':
        return this.erc20.getTxsTokensAndData(rawTx, this.txHelper);
      case 'MBTC':
        return this.mbtc.getTxsTokensAndData(rawTx, this.txHelper);
      case 'Origin':
        return this.origin.getTxsTokensAndData(rawTx, this.txHelper);
      case 'CreateContract':
        return this.contractCreate.getTxsTokensAndData(rawTx);
      case 'ReportIllegalFunc':
      case 'unknown':
      default:
        return this.unknown.getTxsAssetsAndData(rawTx, this.txHelper);
    }
  }

  private sortTxs(txs: ProcessedTx[]): ProcessedTx[] {
    return txs.sort((tx1, tx2) => tx1.block - tx2.block);
  }
}
