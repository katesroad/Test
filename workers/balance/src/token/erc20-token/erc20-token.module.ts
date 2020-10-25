import { Module } from '@nestjs/common';
import { Erc20TokenService } from './erc20-token.service';

@Module({
  providers: [Erc20TokenService],
  exports: [Erc20TokenService],
})
export class Erc20TokenModule {}
