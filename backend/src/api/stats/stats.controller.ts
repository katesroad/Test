import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { TxsStatsQueryDto, TxsStats } from '../../models';
import { StatsService } from './stats.service';
import { TxsStatsPipe } from './txs-stats.pipe';

@Controller('stats')
export class StatsController {
  constructor(private service: StatsService) {}

  @Get('txs')
  @UsePipes(TxsStatsPipe)
  getTxsStats(@Query() query: TxsStatsQueryDto): Promise<TxsStats[]> {
    return this.service.getTxsStats(query);
  }
}
