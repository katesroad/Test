import { Injectable } from '@nestjs/common';
import { AddressClientService } from './address-client.service';
import { BalanceClientService } from './balance-client.service';
import { ClientMsg, FSN_TOKEN } from '../models';

@Injectable()
export class WorkerClientService {
  constructor(
    private addressClient: AddressClientService,
    private balanceClient: BalanceClientService,
  ) {}

  private notify(service: string, msg: ClientMsg<any>): void {
    switch (service) {
      case 'address':
        this.addressClient.notify(msg);
        break;
      case 'balance':
        this.balanceClient.notify(msg);
        break;
      default:
        break;
    }
  }

  updateMinersInfo(miners: string[]): void {
    if (miners.length === 0) return;
    const addressList = miners.map(miner => {
      return { address: miner, miner: true };
    });
    const balanceList = miners.map(miner => {
      return { address: miner, tokens: [FSN_TOKEN] };
    });
    this.notify('address', {
      pattern: 'address',
      data: addressList,
    });
    this.notify('balance', {
      pattern: 'balance',
      data: balanceList,
    });
  }
}
