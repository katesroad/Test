import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  Payload,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';
import { AppService } from './app.service';
import {
  TokenChangeMsg,
  HoldersChangeMsg,
  TokenHoldersMsg,
  TonkenStatsMsg,
} from './models';

@Controller()
export class AppController {
  private logger = new Logger(`worker:token:AppController`);

  constructor(private readonly service: AppService) {}

  // cmd to make stats for token's transaction count, from tx worker
  @MessagePattern('stats')
  updateTokenTxsCount(
    @Payload() msgs: TonkenStatsMsg[],
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.trackTokenTxsStatsInBatch(msgs).then(res => {
      if (res) {
        this.ackMsg(ctx, { startAt, size: msgs.length });
      } else process.exit();
    });
  }

  // cmd to track fusion/erc20 token issue quantity change, from tx worker
  @MessagePattern('supply:change')
  updateTokenSupply(
    @Payload() msg: TokenChangeMsg,
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.updateTokenSupply(msg.token).then(res => {
      if (res) this.ackMsg(ctx, { startAt, size: 1 });
      else process.exit();
    });
  }

  // track token's holder count change
  @MessagePattern('holders:change')
  trackHoldersChange(
    @Payload() msgs: HoldersChangeMsg[],
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.trackHoldersChangeInBatch(msgs).then(res => {
      if (res) this.ackMsg(ctx, { startAt, size: msgs.length });
      else process.exit();
    });
  }

  // track token holders count
  @MessagePattern('holders')
  updateTokenHolders(
    @Payload() msgs: TokenHoldersMsg[],
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.trackHoldersInBatch(msgs).then(res => {
      if (res) this.ackMsg(ctx, { startAt, size: msgs.length });
      else process.exit();
    });
  }

  private ackMsg(ctx: RmqContext, stats: { startAt: number; size: number }) {
    const rawMsg = ctx.getMessage();
    const channel = ctx.getChannelRef();
    const { startAt, size } = stats;
    const cost = Date.now() - startAt;
    const avgCost = cost / size;
    const msg = JSON.parse(rawMsg.content.toString());

    this.logger.log(
      `pattern: ${msg.pattern}\n`,
      `${size} tokens, avgCost: ${avgCost} ms, cost ${cost} ms.`,
    );
    this.logger.log(`Ack ${msg.pattern}`);

    channel.ack(rawMsg);
  }
}
