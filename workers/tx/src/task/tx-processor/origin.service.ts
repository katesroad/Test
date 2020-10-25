import { Injectable } from '@nestjs/common';
import { TxProcessor } from './tx-processor';
import { RawTx, TxAssetsAndData, TxAssetData } from '../../models';
import { TxHelperService } from './tx-helper';
import { WorkerClientService } from '../worker-client/worker-client.service';
import { TRANSACTION_TYPES, FSN_TOKEN } from '../../common';

@Injectable()
export class OriginService {
  constructor(private workerClient: WorkerClientService) {}

  getTxsTokensAndData(
    rawTx: RawTx,
    helper: TxHelperService,
  ): Promise<TxAssetsAndData<any>> {
    const { exchangeReceipts = [], erc20Receipts = [] } = rawTx;

    const isUnknwonTx = erc20Receipts.length === 0;
    const isErc20Transfer = !exchangeReceipts.length && erc20Receipts.length;
    const isFsnTradingPair = exchangeReceipts.length === 1;
    const isErc20TradingPair = exchangeReceipts.length === 2;

    if (isUnknwonTx)
      return TxProcessor.getTxsTokensAndDataForUnknowTx(
        rawTx,
        helper,
        this.workerClient,
      );
    if (isErc20Transfer) {
      return this.processErc20Transfer(rawTx, helper);
    }
    if (isFsnTradingPair) {
      return this.processFsnTradingPair(rawTx, helper);
    }
    if (isErc20TradingPair) {
      return this.processErc20TradingPair(rawTx, helper);
    }
  }

  private async processFsnTradingPair(
    rawTx: RawTx,
    helper: TxHelperService,
  ): Promise<TxAssetsAndData<{ from: TxAssetData; to: TxAssetData }>> {
    const { erc20Receipts, exchangeReceipts } = rawTx;

    const { erc20 } = erc20Receipts[0];
    const { txnsType } = exchangeReceipts[0];
    const erc20TokenSnapshot = await helper.getTokenSnapshot(erc20);
    const fsnSnapshot = { symbol: 'FSN', precision: 18 };

    let fromToken = null;
    let toToken = null;
    let fromAsset: string;
    let toAsset: string;

    if (txnsType === TRANSACTION_TYPES['EthPurchase'].type) {
      fromToken = erc20TokenSnapshot;
      toToken = fsnSnapshot;
      fromAsset = erc20;
      toAsset = FSN_TOKEN;
    }

    // current only support fsn pair
    if (
      txnsType === TRANSACTION_TYPES['TokenPurchase'].type ||
      txnsType === TRANSACTION_TYPES['AddLiquidity'].type ||
      txnsType === TRANSACTION_TYPES['RemoveLiquidity'].type
    ) {
      fromToken = fsnSnapshot;
      toToken = erc20TokenSnapshot;
      fromAsset = FSN_TOKEN;
      toAsset = erc20;
    }

    const { tokenFromAmount, tokenToAmount } = exchangeReceipts[0];
    const fromQty = +tokenFromAmount / Math.pow(10, fromToken.precision);
    const toQty = +tokenToAmount / Math.pow(10, toToken.precision);
    const data = {
      from: {
        token: fromAsset,
        symbol: fromToken.symbol,
        value: fromQty,
      },
      to: {
        token: toAsset,
        symbol: toToken.symbol,
        value: toQty,
      },
    };

    return { tokens: [fromAsset, toAsset], data };
  }

  private async processErc20TradingPair(
    rawTx: RawTx,
    helper: TxHelperService,
  ): Promise<TxAssetsAndData<{ from: TxAssetData; to: TxAssetData }>> {
    const { erc20Receipts, exchangeReceipts } = rawTx;

    const len = erc20Receipts.length;

    const fromAsset = erc20Receipts[0].erc20;
    const toAsset = erc20Receipts[len - 1].erc20;

    const [fromTokenSnapshot, toTokenSnapshot] = await Promise.all([
      helper.getTokenSnapshot(fromAsset),
      helper.getTokenSnapshot(toAsset),
    ]);

    const tokenFromAmount = exchangeReceipts[1].tokenFromAmount;
    const tokenToAmount = exchangeReceipts[0].tokenToAmount;

    const fromQty = tokenFromAmount / Math.pow(10, fromTokenSnapshot.precision);
    const toqQty = tokenToAmount / Math.pow(10, toTokenSnapshot.precision);

    const data = {
      from: {
        token: fromAsset,
        symbol: fromTokenSnapshot.symbol,
        value: fromQty,
      },
      to: {
        token: toAsset,
        symbol: toTokenSnapshot.symbol,
        value: toqQty,
      },
    };

    return { tokens: [fromAsset, toAsset], data };
  }

  private async processErc20Transfer(
    rawTx: RawTx,
    helper: TxHelperService,
  ): Promise<TxAssetsAndData<TxAssetData>> {
    const { erc20Receipts } = rawTx;
    const { erc20, value, logType } = erc20Receipts[0];

    // mightbe Approval here
    if (logType !== 'Transfer') return { data: null, tokens: [] };

    const tokenSnapshot = await helper.getTokenSnapshot(erc20);
    const { symbol, precision } = tokenSnapshot;
    const qty = +value / Math.pow(10, precision);

    const data = { token: erc20, symbol, value: qty };
    const tokens = [erc20];

    return { data, tokens };
  }
}
