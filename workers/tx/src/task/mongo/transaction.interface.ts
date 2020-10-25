import { Document } from 'mongoose';

export default interface TxDoc extends Document {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  type: string;
  status: number;
  blockNumber: number;
  nonce: number;
  ivalue: string;
  dvalue: string;
  gasLimit: number;
  gasPrice: number;
  input: string;
  coinType: string;
  log: any;
}
