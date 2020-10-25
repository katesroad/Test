import { Module } from '@nestjs/common';
import { BalanceClientService } from './balance-client.service';
import { AddressClientService } from './address-client.service';
import { WorkerClientService } from './worker-client.service';
import { ADDRESS_CLIENT_PROVIDER, BALANCE_CLIENT_PROVIDER } from './providers';

@Module({
  providers: [
    ADDRESS_CLIENT_PROVIDER,
    BALANCE_CLIENT_PROVIDER,
    BalanceClientService,
    AddressClientService,
    WorkerClientService,
  ],
  exports: [
    WorkerClientService,
    BalanceClientService,
    AddressClientService,
    WorkerClientService,
  ],
})
export class WorkerClientModule {}
