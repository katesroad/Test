import { Global, Module } from '@nestjs/common';
import { RedisHelperModule } from './redis-helper';
import { HelperService } from './helper.service';

@Global()
@Module({
  imports: [RedisHelperModule],
  providers: [HelperService],
  exports: [HelperService],
})
export class CommonModule {}
