import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { EMPTY, Observable } from 'rxjs';

const Web3 = require('web3');

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
    const handler = this.messageHandlers.get(pattern);
    if (!handler) return Promise.resolve(EMPTY);
    return handler(data);
  }

  private async init() {
    const provider = new Web3.providers.WebsocketProvider(this.wssUrl, {
      timeout: 3000,
      keepalive: true,
      reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 50,
        onTimeout: false,
      },
    });

    const reload = async args => {
      provider.disconnect();
      console.log(args);
      try {
        this.subscription.unsubscribe();
      } catch {}
      await this.init();
    };

    provider.on('error', () => {
      reload(arguments);
    });
    provider.on('disconnect', () => {
      reload(arguments);
    });
    provider.on('connect', async () => {
      console.log('web3 wss connected...\n');
    });

    const web3 = new Web3(provider);
    this.subscription = web3.eth.subscribe(
      'newBlockHeaders',
      (error: Error, blockHeader: any) => {
        if (error) {
          this.logger.error(JSON.stringify(error));
          return;
        }
        web3.eth.getBlock(blockHeader.number).then(async (block: any) => {
          this.call('network:block', block);
          console.log('network height:', block.number);
        });
      },
    );
  }
}
