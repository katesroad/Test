export interface IStakingStats {
  miners: number;
  tickets: number;
}

export interface INetworkSummary extends IStakingStats {
  height: number;
  blocktime: number;
  staked: number;
  supply: number;
  txs?: number;
  progress?: number;
}
