import { Module } from '@nestjs/common';
import { WorkerClientService } from './worker-client.service';
import { TokenClientService } from './token-client.service';
import { AddressClientService } from './address-client.service';
import { ADDRESS_CLIENT_PROVIDER, TOKEN_CLIENT_PROVIDER } from './providers';

@Module({
  providers: [
    ADDRESS_CLIENT_PROVIDER,
    TOKEN_CLIENT_PROVIDER,
    WorkerClientService,
    TokenClientService,
    AddressClientService,
  ],
  exports: [WorkerClientService],
})
export class WorkerClientModule {}
