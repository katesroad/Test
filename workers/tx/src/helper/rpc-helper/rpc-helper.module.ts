import { Module, Global, HttpModule } from '@nestjs/common';
import { RpcHelperService } from './rpc-helper.service';

@Global()
@Module({
  imports: [HttpModule.register({})],
  providers: [RpcHelperService],
  exports: [RpcHelperService],
})
export class RpcHelperModule {}
