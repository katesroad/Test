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
import { CustomLogger, TRANSACTION_TYPES } from '../../common';
import { MbtcService } from './mbtc.service';
import { ContractCreateService } from './contract-create.service';

@Injectable()
export class TxProcessorService extends CustomLogger {
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
    private helper: TxHelperService,
  ) {
    super('TxProcessorService');
  }

  async processTxs(rawTxs: RawTx[]): Promise<ProcessedTx[]> {
    const startAt = Date.now();

    const promises = rawTxs.map(rawTx => this.processTx(rawTx));
    const processedTxs = await Promise.all(promises);
    const txs = processedTxs.filter(
      tx => tx.type !== TRANSACTION_TYPES['Approval'].id,
    ); // don't save approval type to database

    const cost = Date.now() - startAt;
    this.logInfoMsg(`Processed ${txs.length} txs, Cost ${cost} ms.`);

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
        return this.sendAsset.getTxsTokensAndData(rawTx, this.helper);
      case 'TimeLockFunc':
        return this.timelock.getTxsTokensAndData(rawTx, this.helper);
      case 'GenAssetFunc':
        return this.genAsset.getTxsTokensAndData(rawTx);
      case 'AssetValueChangeFunc':
      case 'OldAssetValueChangeFunc':
        return this.assetChange.getTxsTokensAndData(rawTx, this.helper);
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
        return this.erc20.getTxsTokensAndData(rawTx, this.helper);
      case 'MBTC':
        return this.mbtc.getTxsTokensAndData(rawTx, this.helper);
      case 'Origin':
        return this.origin.getTxsTokensAndData(rawTx, this.helper);
      case 'CreateContract':
        return this.contractCreate.getTxsTokensAndData(rawTx);
      case 'ReportIllegalFunc':
      case 'unknown':
      default:
        return this.unknown.getTxsAssetsAndData(rawTx, this.helper);
    }
  }

  private sortTxs(txs: ProcessedTx[]): ProcessedTx[] {
    return txs.sort((tx1, tx2) => tx1.block - tx2.block);
  }
}
