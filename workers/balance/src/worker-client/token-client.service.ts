import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TOKEN_SERVICE_NAME } from './providers';
import { TokenHoldersChangeMsg } from '../models';

@Injectable()
export class TokenClientService {
  readonly pattern = 'holders:change';

  constructor(
    @Inject(TOKEN_SERVICE_NAME) private readonly client: ClientProxy,
  ) {}

  private async onApplicationBootstrap(): Promise<void> {
    await this.client.connect().catch(e => {
      console.error('TokenClientSerivce connection error');
      process.exit();
    });
  }

  notify(msg: TokenHoldersChangeMsg[]): void {
    this.client.emit(this.pattern, msg);
  }
}
