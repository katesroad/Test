export class TxRelatedBalance {
  s: string;
  r?: string;
  tokens?: string[];
}

export class AddressStatsMetadata {
  address: string;
  create_at?: number;
  active_at?: number;
  txs?: number;
  erc20?: boolean;
  usan?: number;
  contract?: boolean;
  anchor?: {
    first: number;
    last: number;
  };
}

export class AddressStatsMap {
  [key: string]: AddressStatsMetadata;
}

export class ClientMsg<T> {
  pattern: string;
  data: T;
}

export class TokenStatsMsg {
  txs: number;
  token: string;
}

export class TokenChangeMsg {
  token: string;
}

export class TokenCreationMsg {
  tx: string;
}

export class TxProgressMsg {
  block: number;
}

export class TxCountMsg {
  erc20?: number;
  txs: number;
}
