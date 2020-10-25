import { Module, HttpModule } from '@nestjs/common';
import { RpcService } from './rpc.service';

@Module({
  imports: [HttpModule.register({})],
  providers: [RpcService],
  exports: [RpcService],
})
export class RpcModule {}
