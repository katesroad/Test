import { Injectable, Inject } from '@nestjs/common';
import { TxRelatedBalance } from '../../models';
import { ClientSerivce } from './client-service';
import { BALANCE_SERVICE_NAME } from './providers';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class BalanceClientService extends ClientSerivce<TxRelatedBalance> {
  readonly patterns = ['balance', 'tl_balance'];

  constructor(@Inject(BALANCE_SERVICE_NAME) readonly client: ClientProxy) {
    super('BalanceClient');
    this.client = client;
  }
}
