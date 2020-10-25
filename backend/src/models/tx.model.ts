export interface ITx {
  id: number;
  hash: string;
  status: number;
  block: number;
  fee: number;
  type: number;
  sender: string;
  receiver: string;
  data?: any;
  timestamp: number;
}

export interface ITxs {
  total: number;
  txs: ITx[];
}
