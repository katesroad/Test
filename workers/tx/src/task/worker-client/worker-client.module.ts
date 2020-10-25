import { Module } from '@nestjs/common';
import { TokenClientService } from './token-client.service';
import { BalanceClientService } from './balance-client.service';
import { AddressClientService } from './address-client.service';
import { WorkerClientService } from './worker-client.service';
import { ServerClientService } from './server-client.service';
import {
  TOKEN_CLIENT_PROVIDER,
  ADDRESS_CLIENT_PROVIDER,
  BALANCE_CLIENT_PROVIDER,
  SERVER_CLIENT_PROVIDER,
} from './providers';

@Module({
  providers: [
    TOKEN_CLIENT_PROVIDER,
    ADDRESS_CLIENT_PROVIDER,
    BALANCE_CLIENT_PROVIDER,
    SERVER_CLIENT_PROVIDER,
    BalanceClientService,
    AddressClientService,
    TokenClientService,
    WorkerClientService,
    ServerClientService,
  ],
  exports: [
    WorkerClientService,
    BalanceClientService,
    AddressClientService,
    TokenClientService,
    WorkerClientService,
    ServerClientService,
  ],
})
export class WorkerClientModule {}
