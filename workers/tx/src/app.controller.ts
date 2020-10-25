import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}

  @MessagePattern('network:block')
  updateNetworkState(@Payload() msg: any) {
    this.service.makeNetworkTxsStats(msg);
  }
}
