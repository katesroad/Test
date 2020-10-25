import { Injectable } from '@nestjs/common';
import { PgSwapsService } from '../../shared';

@Injectable()
export class SwapService {
  constructor(private service: PgSwapsService) {}

  getSwapByHash(hash: string) {
    console.log(hash);
    return this.service.getSwapByHash(hash.trim());
  }
}
