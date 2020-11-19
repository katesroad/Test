import { Global, Module } from '@nestjs/common';
import { HelperService } from './helper.service';
import { RedisHelperModule } from './redis-helper';

@Global()
@Module({
  imports: [RedisHelperModule],
  providers: [HelperService],
  exports: [HelperService],
})
export class CommonModule {}
