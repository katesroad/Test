import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TxProgressMsg, TxCountMsg } from '../../models';
import { ClientSerivce } from './client-service';
import { SERVER_SERVICE_NAME } from './providers';

@Injectable()
export class ServerClientService extends ClientSerivce<
  TxProgressMsg | TxCountMsg
> {
  readonly patterns = ['tx:count', 'tx:progress', 'tx:l6txs'];

  constructor(@Inject(SERVER_SERVICE_NAME) readonly client: ClientProxy) {
    super('ServerClient');
    this.client = client;
  }
}
