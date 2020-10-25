import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ADDRESS_SERVICE_NAME } from './providers';
import { AddressHoldingsMsg } from '../models';

@Injectable()
export class AddressClientService {
  readonly pattern = 'address:holdings';

  constructor(
    @Inject(ADDRESS_SERVICE_NAME) private readonly client: ClientProxy,
  ) {}

  private async onApplicationBootstrap(): Promise<void> {
    await this.client.connect().catch(e => {
      console.error('AddressClientService connection error');
      process.exit();
    });
  }

  notify(msg: AddressHoldingsMsg[]): void {
    this.client.emit(this.pattern, msg);
  }
}
