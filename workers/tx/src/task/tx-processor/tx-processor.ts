import { ProcessedTx, RawTx, TxAssetsAndData } from '../../models';
import { TxHelperService } from './tx-helper';
import { WorkerClientService } from '../worker-client';

import {
  TRANSACTION_TYPES,
  FSN_CONTRACT,
  FSN_TOKEN,
  SMART_CONTRACT_TIMELOCKFUNCS,
} from '../../common';

export abstract class TxProcessor {
  static cleanTx(rawTx: RawTx): ProcessedTx {
    const {
      gasPrice,
      gasUsed,
      from,
      timestamp,
      type,
      erc20Receipts = [],
      ...tx
    } = rawTx;
    const txData = { ...tx };
    let sender = from;

    delete txData.ivalue;
    delete txData.dvalue;
    delete txData.exchangeReceipts;
    delete txData.log;
    delete txData.to;

    if (type === 'ERC20' && erc20Receipts[0]) {
      const { logType } = erc20Receipts;
      if (logType === 'Transfer') {
        sender = erc20Receipts[0].from || from;
      }
    }

    const fee = (gasPrice * gasUsed) / Math.pow(10, 18);

    const receiver = TxProcessor.getTxsRecevier(rawTx);
    const typeID = TxProcessor.getTxsTypeID(rawTx);

    return { ...txData, type: typeID, sender, receiver, fee, age: timestamp };
  }

  static getTxsRecevier(rawTx: RawTx): string {
    const { to, type, erc20Receipts = [], exchangeReceipts = [], log } = rawTx;
    switch (type) {
      case TRANSACTION_TYPES['SendAssetFunc'].type:
      case TRANSACTION_TYPES['TimeLockFunc'].type:
        // 0x0362079985e5cbd48868ed1d1d4224c6d85747710c41a0ea92d76fd3e3bb0c2d at testnet
        return (log && log.To) || FSN_CONTRACT;
      case TRANSACTION_TYPES['GenAssetFunc'].type:
      case TRANSACTION_TYPES['AssetValueChangeFunc'].type:
      case TRANSACTION_TYPES['GenNotationFunc'].type:
      case TRANSACTION_TYPES['ReportIllegalFunc'].type:
      case TRANSACTION_TYPES['MakeSwapFunc'].type:
      case TRANSACTION_TYPES['RecallSwapFunc'].type:
      case TRANSACTION_TYPES['TakeSwapFunc'].type:
      case TRANSACTION_TYPES['MakeSwapFuncExt'].type:
      case TRANSACTION_TYPES['TakeMultiSwapFunc'].type:
      case TRANSACTION_TYPES['RecallMultiSwapFunc'].type:
      case TRANSACTION_TYPES['TakeMultiSwapFunc'].type:
      case TRANSACTION_TYPES['ReportIllegalFunc'].type:
      case TRANSACTION_TYPES['CreateContract'].type:
        return FSN_CONTRACT;
      case 'ERC20': {
        const { logType } = erc20Receipts[0] && erc20Receipts[0];
        if (logType === 'Transfer') {
          return erc20Receipts[0].to || to;
        }
        // approval use it directly
        return to;
      }
      case 'Origin':
      case 'unknown':
      default: {
        if (!erc20Receipts.length) {
          return TxProcessor.getTxsRecevierForUnkownTx(rawTx);
        }
        if (exchangeReceipts.length) return to;
        else return erc20Receipts[0].to;
      }
    }
  }

  static getTxsTypeID(rawTx: RawTx): number {
    const { log, erc20Receipts, exchangeReceipts } = rawTx;
    let type: number;

    if (rawTx.type !== 'unknown' && TRANSACTION_TYPES[rawTx.type]) {
      return TRANSACTION_TYPES[rawTx.type].id;
    }

    // log is null
    if (!log) return TRANSACTION_TYPES['SendAssetFunc'].id;

    const isContractLog = Array.isArray(log);

    if (!isContractLog) return TRANSACTION_TYPES['unknown'].id;

    // log is emited from unkown smart contract
    if (!erc20Receipts && isContractLog) {
      log.map((logItem: any) => {
        const { topic } = logItem;
        if (SMART_CONTRACT_TIMELOCKFUNCS.includes(topic))
          type = TRANSACTION_TYPES['TimeLockFunc'].id;
        else type = TRANSACTION_TYPES['unknown'].id;
      });
      return type;
    }

    // log is erc20 log
    if (!exchangeReceipts) {
      const logType = erc20Receipts[0].logType;
      return TRANSACTION_TYPES[logType].id;
    }

    // log is exchange trading log for fsn to any erc20 token
    if (exchangeReceipts.length === 1) {
      const txnsType = exchangeReceipts[0].txnsType;
      return TRANSACTION_TYPES[txnsType].id;
    }

    // log is erc20 trading pair's log
    return TRANSACTION_TYPES['DexSwap'].id;
  }

  static async getTxsTokensAndDataForUnknowTx(
    rawTx: RawTx,
    tokenService: TxHelperService,
    workerClient: WorkerClientService,
  ): Promise<TxAssetsAndData<any>> {
    const { log, ivalue, dvalue, erc20Receipts } = rawTx;
    const isContractLog = Array.isArray(log);

    let data: any = null;
    const tokens: string[] = [];

    if (!log || (log && !isContractLog)) {
      const value = +ivalue + +dvalue / Math.pow(10, 18);
      data = { symbol: 'FSN', value, token: FSN_TOKEN };
      tokens.push(FSN_TOKEN);
    }

    if (isContractLog && !erc20Receipts) {
      log.map(async (logItem: any) => {
        const { contract, topic, asset, start, end, value } = logItem;

        if (contract) {
          workerClient.notifyAddressInfo([
            { address: contract, contract: true },
          ]);
        }

        if (SMART_CONTRACT_TIMELOCKFUNCS.includes(topic)) {
          const tokenSnapshot = await tokenService.getTokenSnapshot(asset);
          tokens.push(asset);
          const { symbol, precision } = tokenSnapshot;
          const qty = value / Math.pow(10, precision);
          data = {
            symbol,
            token: asset,
            value: qty,
            startTime: +start,
            endTime: +end,
            lockType: topic,
          };
        } else {
          data = log;
          tokens.push(FSN_TOKEN);
        }
      });
    }

    if (erc20Receipts) {
      try {
        const { erc20, value } = erc20Receipts[0];
        const tokenSnapshot = await tokenService.getTokenSnapshot(erc20);
        const { symbol, precision } = tokenSnapshot;
        const qty = +value / Math.pow(10, precision);
        data = { value: qty, token: erc20, symbol };
        tokens.push(erc20);
      } catch {}
    }

    return { tokens, data };
  }

  static getTxsRecevierForUnkownTx(rawTx: RawTx): string {
    const { log, to, erc20Receipts = [], exchangeReceipts = [] } = rawTx;

    // log is null
    if (!log) return rawTx.to;

    const isContractLog = Array.isArray(log);

    // log is object
    if (!isContractLog) {
      const receiver = to;
      if (receiver === FSN_CONTRACT) return log.To || to;
      else return to;
    }

    // log is unknow smart contract's log
    if (isContractLog && !erc20Receipts.length) {
      let receiver: string;
      rawTx.log.map((logItem: any) => {
        receiver = logItem.to;
      });
      return receiver || to;
    }

    // erc20 transfer
    // fsn trading pair
    if (erc20Receipts.length === 1) {
      return rawTx.erc20Receipts[0].to;
    }
    //any anyswap trading
    if (exchangeReceipts.length) {
      return rawTx.to;
    }
  }
}
