import { Controller } from '@nestjs/common';
import {
  Payload,
  MessagePattern,
  Ctx,
  RmqContext,
} from '@nestjs/microservices';
import { AppService } from './app.service';
import {
  AddressFsnSwapStatsMsg,
  AddressHoldingStatsMsg,
  AddressTxStatsMsg,
} from './models';
import { CustomLogger } from './common';

@Controller()
export class AppController extends CustomLogger {
  constructor(private readonly service: AppService) {
    super('AppController');
  }

  /**
   * source: cmd from tx processor worker
   * msg format: please refer AddressInfoMsg
   */
  @MessagePattern('address')
  statsAddress(
    @Payload() msgs: AddressTxStatsMsg[],
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.trackAddressInBatch(msgs).then(success => {
      if (success) {
        this.ackMsg(ctx, { startAt, size: msgs.length });
      } else process.exit();
    });
  }

  /**
   * source: cmd from balance worker
   * msg format: please refer HoldingsStatsMsg
   * usage: track how many types of fusion/erc20 tokens an address have
   */
  @MessagePattern('address:holdings')
  statsHolding(
    @Payload() msgs: AddressHoldingStatsMsg[],
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.trackAddressesHoldingsInBatch(msgs).then(res => {
      if (res) {
        this.ackMsg(ctx, { startAt, size: msgs.length });
      } else process.exit();
    });
  }

  /**
   * source: cmd from tx worker
   * usage: track how many active swaps an address still has
   * msg format: please refer AddressFsnSwapStatsMsg
   */
  @MessagePattern('address:swaps')
  statsAddressSwaps(
    @Payload() msg: AddressFsnSwapStatsMsg,
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.statsAddressSwaps(msg).then(res => {
      if (res) this.ackMsg(ctx, { startAt, size: 1 });
      //restart application if there is/are transaction conflict/s.
      else process.exit();
    });
  }

  // ack rabbitmq message, and log data processing stats
  private ackMsg(ctx: RmqContext, stats: { startAt: number; size: number }) {
    const rawMsg = ctx.getMessage();
    const channel = ctx.getChannelRef();

    const msg = JSON.parse(rawMsg.content.toString());
    const { startAt, size } = stats;
    const cost = Date.now() - startAt;
    const avgCost = (cost / size).toFixed(2);

    this.logMsg(
      `Ack ${msg.pattern}:
      ${size} addresses, avg cost: ${avgCost} ms/address , cost ${cost} ms. \n`,
    );

    channel.ack(rawMsg);
  }
}
