import { hasUncaughtExceptionCaptureCallback } from 'process';

export class TokenSnapshot {
  precision: number;
  symbol: string;
}

export class TokenStats {
  create_at: number;
  active_at: number;
  txs: number;
}

export class TokenMetaData extends TokenSnapshot {
  hash: string;
  name: string;
  qty: number;
}

export class TokenData extends TokenMetaData {
  issuer: string;
  issue_tx: string;
  create_at: number;
  active_at: number;
  info?: any;
  canchange?: boolean; // erc20 doesn't have this property
  token_type: number; // 0, native, 1: erc20
}
