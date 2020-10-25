import { Injectable } from '@nestjs/common';
import { AddressClientService } from './address-client.service';
import { BalanceClientService } from './balance-client.service';
import { ClientMsg, FSN_TOKEN } from '../models';
import { from } from 'rxjs';

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
    from(miners).subscribe(miner => {
      this.notify('address', {
        pattern: 'address',
        data: {
          address: miner,
          miner: true,
        },
      });

      this.notify('balance', {
        pattern: 'balance',
        data: {
          s: miner,
          tokens: [FSN_TOKEN],
        },
      });
    });
  }
}
