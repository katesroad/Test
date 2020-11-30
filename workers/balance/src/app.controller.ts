import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  Payload,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';
import { resolveSoa } from 'dns';
import { AppService } from './app.service';
import { TxBalanceMsg } from './models';

@Controller()
export class AppController {
  private logger = new Logger(`AppController`);

  constructor(private readonly service: AppService) {}

  @MessagePattern('balance')
  updateAddressBalance(
    @Payload() msgs: TxBalanceMsg[],
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.processBalanceMsgInBatch(msgs).then(res => {
      if (res) {
        this.ackMsg(ctx, { startAt, size: msgs.length });
      } else process.exit();
    });
  }

  private async ackMsg(ctx: RmqContext, stats: { startAt: number; size: number }) {
    const rawMsg = ctx.getMessage();
    const channel = ctx.getChannelRef();
    const { startAt, size } = stats;
    const cost = Date.now() - startAt;
    const avgCost = (cost / size).toFixed(2);
    const msg = JSON.parse(rawMsg.content.toString());

    this.logger.log(
      `\n Ack ${msg.pattern}:
         ${size} holders, avgCost: ${avgCost} ms/holder, cost ${cost} ms \n`,
    );
    // avoid rpc service crash
    await this.sleep(200);
    channel.ackMsg(rawMsg);
  }

  private sleep(ms) {
    return new Promise((resolve ) => {
      setTimeout(() => {
        resolve(ms);
      }, ms);
    })
  }
}
