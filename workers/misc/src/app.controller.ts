import { Controller } from '@nestjs/common';
import {
  Payload,
  MessagePattern,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { AppService } from './app.service';
import { PgAddress, HoldingsStats } from './models';
import { CustomLogger } from './common';

@Controller()
export class AppController extends CustomLogger {
  constructor(private readonly service: AppService) {
    super('AppController');
  }

  @MessagePattern('address')
  statsAddress(@Payload() msg: Partial<PgAddress>, @Ctx() ctx: RmqContext) {
    this.service.trackAddress(msg).then(success => {
      if (success) this.ackMsg(ctx);
      else process.exit();
    });
  }

  @MessagePattern('address:holdings')
  statsHolding(@Payload() msg: HoldingsStats, @Ctx() ctx: RmqContext) {
    this.service.statsAddressHolings(msg).then(res => {
      if (res) this.ackMsg(ctx);
      else process.exit();
    });
  }

  private ackMsg(ctx: RmqContext) {
    const rawMsg = ctx.getMessage();
    const channel = ctx.getChannelRef();
    channel.ack(rawMsg);

    const msg = JSON.parse(rawMsg.content.toString());
    this.logger.log(`Ack ${msg.pattern}`);
  }
}
