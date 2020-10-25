import { Schema } from 'mongoose';

const schema = new Schema(
  {
    _id: String,
    hash: String,
    nonce: Number,
    blockHash: String,
    blockNumber: Number,
    transactionIndex: Number,
    from: String,
    to: String,
    value: String,
    ivalue: String,
    dvalue: String,
    gasLimit: Number,
    gasPrice: String,
    gasUsed: Number,
    timestamp: Number,
    input: String,
    status: Number,
    coinType: String,
    type: String,
    log: Object,
  },
  {
    collection: 'Transactions',
    versionKey: false,
  },
);

export default schema;
