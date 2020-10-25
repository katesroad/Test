export class TxBalanceMsg {
  address: string;
  tokens?: string[];
  tlTokens: string[];
}

export class ClientMsg<T> {
  pattern: string;
  msg: T;
}

export class AddressHoldingsMsg {
  type: string; // erc20, fusion
  address: string;
  count: number; //exp: -1 || 1
}

export class TokenHoldersChangeMsg {
  token: string;
  count: number;
}
