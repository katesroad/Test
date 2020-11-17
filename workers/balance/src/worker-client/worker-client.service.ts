import { Injectable } from '@nestjs/common';
import { TokenClientService } from './token-client.service';
import { AddressClientService } from './address-client.service';
import { AddressHoldingsMsg, TokenHoldersChangeMsg } from '../models';

@Injectable()
export class WorkerClientService {
  constructor(
    private readonly token: TokenClientService,
    private readonly address: AddressClientService,
  ) {}

  notifyAddressHoldingsChange(msg: AddressHoldingsMsg[]) {
    this.address.notify(msg);
  }

  notifyTokenHoldersChange(msg: TokenHoldersChangeMsg[]) {
    this.token.notify(msg);
  }
}
