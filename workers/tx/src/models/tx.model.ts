export class TxBase {
  hash: string;
  status: number;
  block: number;
}

export class RawTx extends TxBase {
  timestamp: number;
  gasPrice: number;
  gasUsed: number;
  from: string;
  to: string;
  type: string;
  ivalue: string;
  dvalue: string;
  log: any;
  erc20Receipts?: any;
  exchangeReceipts?: any;
}

export class ProcessedTx extends TxBase {
  fee: number;
  sender: string;
  receiver: string;
  type: number;
  tokens?: string[];
  data?: any;
  age: number; //timestamp, to avoid keyword conflicts in pg
}

export class PgTx extends TxBase {
  tokens?: string;
  data?: string;
}

export class TxAssetData {
  token: string;
  symbol: string;
  value: number;
}

export class SendAssetTxData extends TxAssetData {}

export class AssetChangeTxData extends TxAssetData {
  isInc: boolean;
}

export class TimeLockTxsData extends SendAssetTxData {
  startTime: number;
  endTime: number;
  type: string;
}

export class TxAssetsAndData<T> {
  data?: T;
  tokens?: string[];
}

export class TxsRange {
  $lte: number;
  $gt: number;
}

export class RangeRawTxs {
  syncHeight: number;
  rawTxs: RawTx[];
}

export class RangeTxsStats {
  stats_at: number;
  stats: {
    txs: number;
    ticket_txs: number;
  };
}
