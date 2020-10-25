import { IsNumber, IsOptional } from 'class-validator';

export class TxsStatsQueryDto {
  @IsNumber()
  @IsOptional()
  from?: number;

  @IsNumber()
  @IsOptional()
  to?: number;
}

export interface TxsStats {
  stats: any;
  stats_at: number;
}
