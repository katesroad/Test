import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AddressStatsMetadata } from '../../models';
import { ADDRESS_SERVICE_NAME } from './providers';
import { ClientSerivce } from './client-service';

@Injectable()
export class AddressClientService extends ClientSerivce<AddressStatsMetadata> {
  readonly patterns = ['address', 'address:swaps'];

  constructor(@Inject(ADDRESS_SERVICE_NAME) readonly client: ClientProxy) {
    super('AddressClient');
    this.client = client;
  }
}
