import { Document } from 'mongoose';

export default interface BlockDoc extends Document {
  _id: string;
  hash: string;
  parentHash: string;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  size: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  blockTime: string;
  avgGasprice: string;
  retreatTickets: string[];
  retreatMiners: string[];
  selectedTicket: string;
  ticketOrder: string;
  ticketNumber: string;
  reward: string | number;
  txcount: string;
  number: number;
}
