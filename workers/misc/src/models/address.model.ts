export interface MinerAddress {
  hash: string;
  miner: boolean;
}

export interface PgAddress extends Partial<MinerAddress> {
  create_at?: number;
  active_at?: number;
  hash: string;
  miner?: boolean;
  erc20?: boolean;
  contract?: boolean;
  label?: string;
  txs: number;
}

export interface HoldingsStats {
  address: string;
  count: number;
  type: string;
}
