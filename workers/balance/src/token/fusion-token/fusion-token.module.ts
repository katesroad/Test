import { Module, HttpModule } from '@nestjs/common';
import { FusionTokenService } from './fusion-token.service';

@Module({
  imports: [HttpModule],
  providers: [FusionTokenService],
  exports: [FusionTokenService],
})
export class FusionTokenModule {}
