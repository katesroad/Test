export class AddressTxStatsMsg {
  address: string;
  erc20?: boolean;
  miner?: boolean;
  txs?: number;
  create_at?: number;
  active_at?: number;
  countTl?: boolean;
}

export class AddressHoldingStatsMsg {
  address: string;
  fusion?: number;
  erc20?: number;
}

export class AddressFsnSwapStatsMsg {
  address: string;
  count: number;
}
