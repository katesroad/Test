export class AddressStats {
  create_at: number;
  active_at: number;
  txs: number;
  fusion_tokens: number;
  erc20_tokens: number;
  swaps: number;
}

export class PgAddress extends AddressStats {
  hash: string;
  miner: boolean;
  erc20: boolean;
  contract: boolean;
  label: string;
  tl_tokens: number;
}
