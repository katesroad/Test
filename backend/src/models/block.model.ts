export interface Block {
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
}

export interface IBlock extends Block {
  height: number;
  reward: number;
  txs: number;
}

export class BlockQueryDto {
  page: number;
  size: number;
  order: -1 | 1;
}

export class IPagedBlock {
  txs: number;
  miner: string;
  reward: number;
  height: number;
}

export interface IBlock {
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
  height: number;
  reward: number;
  txs: number;
}
