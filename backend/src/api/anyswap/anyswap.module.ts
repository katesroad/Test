import { Module } from '@nestjs/common';
import { AnyswapController } from './anyswap.controller';
import { AnyswapService } from './anyswap.service';

@Module({
  controllers: [AnyswapController],
  providers: [AnyswapService],
})
export class AnyswapModule {}
