import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { HelperService } from './shared';
import { AppGateway } from './app.gateway';

@Controller()
export class AppController {
  constructor(private service: HelperService, private gateway: AppGateway) {}

  @MessagePattern('network:block')
  async updateNetworkState(@Payload() msg: any) {
    const block = this.service.getBlockData(msg);
    this.gateway.wss.emit('network:block', block);
    this.service
      .getBlockReward()
      .then(reward =>
        this.gateway.wss.emit('network:block', { ...block, reward }),
      );
    this.service.updateNetworkState(msg.number);
    this.service
      .getNetworkSummary()
      .then(data => this.gateway.wss.emit('network', data));
  }

  @MessagePattern('tx:count')
  storeTxCount(@Payload() msg: { txs: number; erc20: number }): void {
    this.gateway.wss.emit('tx:count', msg);
  }

  @MessagePattern('tx:progress')
  storeTxDecodingProgress(@Payload() msg: { block: number }): void {
    this.gateway.wss.emit('tx:progress', msg);
  }

  @MessagePattern('tx:l6txs')
  storeL6Txs(@Payload() msg: any[]): void {
    this.gateway.wss.emit('network:l6txs', msg);
  }
}
