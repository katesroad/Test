export class AddressInfoMsg {
  hash: string;
  erc20?: boolean;
  miner?: boolean;
  txs?: number;
  // -1 represents -1, 1 represents +1
  assets?: number;
  // -1 represents -1, 1 represents +1
  tlAssets?: number;
  // -1 represents -1, 1 represents +1
  erc20Assets?: number;
}
