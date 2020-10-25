import { Controller, Get, Param } from '@nestjs/common';
import { SwapService } from './swap.service';

@Controller('swap')
export class SwapController {
  constructor(private service: SwapService) {}

  @Get(':hash')
  getSwapByHash(@Param('hash') hash: string) {
    return this.service.getSwapByHash(hash);
  }
}
