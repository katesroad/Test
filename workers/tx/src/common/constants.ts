export const TRANSACTION_TYPES = {
  unknown: { type: 'unknown', id: -1 },
  GenNotationFunc: { type: 'GenNotationFunc', id: 0 },
  GenAssetFunc: { type: 'GenAssetFunc', id: 1 },
  OldAssetValueChangeFunc: { type: 'OldAssetValueChangeFunc', id: 1 },
  AssetValueChangeFunc: { type: 'AssetValueChangeFunc', id: 1 },
  SendAssetFunc: { type: 'SendAssetFunc', id: 2 },
  Transfer: { type: 'Transfer', id: 2 },
  TimeLockFunc: { type: 'TimeLokcFunc', id: 3 },
  MakeSwapFunc: { type: 'MakeSwapFunc', id: 4 },
  MakeSwapFuncExt: { type: 'MakeSwapFuncExt', id: 4 },
  MakeMultiSwapFunc: { type: 'MakeMultipleSwapFunc', id: 4 },
  RecallSwapFunc: { type: 'RecallSwapFunc', id: 5 },
  RecallMultiSwapFunc: { type: 'RecallMultiSwapFunc', id: 5 },
  TakeSwapFunc: { type: 'TakeSwapFunc', id: 6 },
  TakeSwapFuncExt: { type: 'TakeSwapFuncExt', id: 6 },
  TakeMultiSwapFunc: { type: 'TakeMultiSwapFunc', id: 6 },
  EmptyFunc: { type: 'EmptyFunc', id: 7 },
  ReportIllegalFunc: { type: 'ReportIllegalFunc', id: 8 },
  TokenPurchase: { type: 'TokenPurchase', id: 9 },
  EthPurchase: { type: 'EthPurchase', id: 9 },
  DexSwap: { type: 'AnySwap', id: 9 },
  AddLiquidity: { type: 'AddLiquidity', id: 10 },
  RemoveLiquidity: { type: 'RemoveLiquidity', id: 11 },
  Approval: { type: 'Approval', id: -3 },
  CreateContract: { type: 'CreateContract', id: 12 },
};

export const SWAP_TYPES = [
  'MakeSwapFunc',
  'RecallSwapFunc',
  'TakeSwapFunc',
  'MakeSwapFuncExt',
  'TakeSwapFuncExt',
  'MakeMultiSwapFunc',
  'RecallMultiSwapFunc',
  'TakeMultiSwapFunc',
];

export const SWAP_TYPES_IDS = [
  TRANSACTION_TYPES['MakeSwapFunc'].id,
  TRANSACTION_TYPES['RecallSwapFunc'].id,
  TRANSACTION_TYPES['TakeSwapFunc'].id,
  TRANSACTION_TYPES['MakeMultiSwapFunc'].id,
  TRANSACTION_TYPES['TakeMultiSwapFunc'].id,
  TRANSACTION_TYPES['RecallMultiSwapFunc'].id,
];

export const NONE_NATIVE_TRANSACTION_TYPES = [
  'ERC20',
  'Origin',
  'MBTC',
  'unknown',
];

export const FSN_TOKEN =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

export const FSN_CONTRACT = '0xffffffffffffffffffffffffffffffffffffffff';

export const SMART_CONTRACT_TIMELOCKFUNCS = [
  'TimeLockContractSend',
  'TimeLockContractReceive',
];
