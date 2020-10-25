import { Document } from 'mongoose';

export default interface TxDoc extends Document {
  _id: string;
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  type: string;
  status: number;
  blockNumber: number;
  nonce: number;
  transactionIndex: number;
  value: string;
  ivalue: string;
  dvalue: string;
  gasLimit: number;
  gasPrice: number;
  input: string;
  coinType: string;
  log: any;
}
