import {
  Server,
  CustomTransportStrategy,
  MessageHandler,
} from '@nestjs/microservices';
import { EMPTY, Observable } from 'rxjs';

const Web3 = require('web3');

/**
 * Documents to read:
 * >1. Customize microservice strategy in Nest.js: https://docs.nestjs.com/microservices/custom-transport
 * >2. Methods to implements: nest/packages/microservices/interfaces/custom-transport-strategy.interface.ts
 * >3. Ethereum Server for Nest.js: https://trejgun.github.io/articles/ethereum-server-for-nestjs/
 */
export class Web3Server extends Server implements CustomTransportStrategy {
  private subscription: any;
  private wssUrl: string;

  constructor(wssUrl: string) {
    super();
    this.wssUrl = wssUrl;
  }

  public async listen(cb: () => void) {
    await this.init();
    cb();
  }

  public close(): void {
    this.subscription.unsubscribe();
  }

  private call(pattern: string, data: any): Promise<Observable<any>> {
    const handler: MessageHandler | undefined = this.messageHandlers.get(
      pattern,
    );

    if (!handler) return Promise.resolve(EMPTY);

    return handler(data);
  }

  private async init() {
    const provider = new Web3.providers.WebsocketProvider(this.wssUrl);
    const web3 = new Web3(provider);
    this.subscription = web3.eth.subscribe(
      'newBlockHeaders',
      (error: Error, blockHeader: any) => {
        if (error) {
          this.logger.error(JSON.stringify(error));
          return;
        }
        web3.eth
          .getBlock(blockHeader.number)
          .then(async (block: any) => this.call('network:block', block));
      },
    );
  }
}
