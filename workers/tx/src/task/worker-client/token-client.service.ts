import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ClientSerivce } from './client-service';
import { TOKEN_SERVICE_NAME } from './providers';
import { TokenStatsMsg, TokenChangeMsg, TokenCreationMsg } from '../../models';

@Injectable()
export class TokenClientService extends ClientSerivce<
  TokenStatsMsg | TokenChangeMsg | TokenCreationMsg
> {
  readonly patterns = ['token:new', 'token:change', 'token:txs', 'token:erc20'];

  constructor(@Inject(TOKEN_SERVICE_NAME) readonly client: ClientProxy) {
    super('TokenClient');
    this.client = client;
  }
}
