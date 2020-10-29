import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  Payload,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';
import { AppService } from './app.service';
import {
  TokenTxsCountMsg,
  TokenHoldersCountMsg,
  // TokenErc20Msg,
  TokenChangeMsg,
  // TokenGenerationMsg,
} from './models';

@Controller()
export class AppController {
  private logger = new Logger(`worker:token:AppController`);

  constructor(private readonly service: AppService) {}

  // cmd to make stats for token's transaction count, from tx worker
  @MessagePattern('token:txs')
  updateTokenTxsCount(
    @Payload() msgs: TokenTxsCountMsg[],
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.trackTokensStatsInBatch(msgs).then(res => {
      if (res) {
        this.ackMsg(ctx, { startAt, size: msgs.length });
      } else process.exit();
    });
  }

  // cmd to track fusion token generation, from tx worker
  // no longer in use as token creation happens at tx worker
  /* @MessagePattern('token:new')
  createToken(
    @Payload() msg: TokenGenerationMsg,
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.createTokenByTxHash(msg.tx).then(res => {
      if (res) this.ackMsg(ctx, { startAt, size: 1 });
      else process.exit();
    });
  }*/

  // cmd to track fusion/erc20 token issue quantity change, from tx worker
  @MessagePattern('token:change')
  updateTokenQuantity(
    @Payload() msg: TokenChangeMsg,
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.updateTokenSupply(msg.token).then(res => {
      if (res) this.ackMsg(ctx, { startAt, size: 1 });
      else process.exit();
    });
  }

  // cmd to make stats for token's holders count, from balance worker
  @MessagePattern('token:holders')
  updateTokenHoldersCount(
    @Payload() msgs: TokenHoldersCountMsg[],
    @Ctx() ctx: RmqContext,
  ): void {
    const startAt = Date.now();
    this.service.trackTokensHoldersCountInBatch(msgs).then(res => {
      if (res) this.ackMsg(ctx, { startAt, size: msgs.length });
      else process.exit();
    });
  }

  // cmd to track erc20 token information, from tx worker
  // no longer in use as token creation happens at tx worker
  /*
  @MessagePattern('token:erc20')
  trackErc20Token(@Payload() msg: TokenErc20Msg, @Ctx() ctx: RmqContext): void {
    const startAt = Date.now();
    this.service.createErc20Token(msg).then(res => {
      if (res) this.ackMsg(ctx, { startAt, size: 1 });
      else process.exit();
    });
  }
*/
  private ackMsg(ctx: RmqContext, stats: { startAt: number; size: number }) {
    const rawMsg = ctx.getMessage();
    const channel = ctx.getChannelRef();
    const { startAt, size } = stats;
    const cost = Date.now() - startAt;
    const avgCost = cost / size;
    const msg = JSON.parse(rawMsg.content.toString());

    this.logger.log(
      `processed ${size} tokens, avgCost: ${avgCost} ms, cost ${cost} ms.`,
    );
    this.logger.log(`Ack ${msg.pattern}`);

    channel.ack(rawMsg);
  }
}
