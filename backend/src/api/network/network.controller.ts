import {
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { INetworkSummary } from '../../models';
import { NetworkService } from './network.service';

@Controller('network')
@UseInterceptors(CacheInterceptor)
export class NetworkController {
  constructor(private service: NetworkService) {}

  @Get()
  @CacheTTL(4)
  async getNetworkSummary(): Promise<INetworkSummary> {
    return this.service.getNetworkSummary();
  }

  @Get('latest')
  @CacheTTL(4)
  async getLBksTxs(): Promise<{ bks: any[]; txs: any[] }> {
    return this.service.getLBKsTxs();
  }
}
