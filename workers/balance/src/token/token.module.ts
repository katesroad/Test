import { Module } from '@nestjs/common';
import { FusionTokenModule } from './fusion-token';
import { Erc20TokenModule } from './erc20-token';
import { TokenService } from './token.service';

@Module({
  imports: [FusionTokenModule, Erc20TokenModule],
  providers: [TokenService],
  exports: [FusionTokenModule, Erc20TokenModule, TokenService],
})
export class TokenModule {}
