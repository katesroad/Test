import { Injectable } from '@nestjs/common';
import { TokenClientService } from './token-client.service';
import { AddressClientService } from './address-client.service';
import { ServerClientService } from './server-client.service';
import { BalanceClientService } from './balance-client.service';
import { ClientMsg, ProcessedTx, AddressStatsMetadata } from '../../models';
import { TRANSACTION_TYPES, SWAP_TYPES_IDS, FSN_TOKEN } from '../../common';

@Injectable()
export class WorkerClientService {
  constructor(
    private tokenClient: TokenClientService,
    private addressClient: AddressClientService,
    private serverClient: ServerClientService,
    private balanceClient: BalanceClientService,
  ) {}

  private notify(service: string, msg: ClientMsg<any>): void {
    switch (service) {
      case 'address':
        this.addressClient.notify(msg);
        break;
      case 'token':
        this.tokenClient.notify(msg);
        break;
      case 'server':
        this.serverClient.notify(msg);
        break;
      case 'balance':
        this.balanceClient.notify(msg);
        break;
      default:
        break;
    }
  }

  notifyBalancesChangeByTxs(txs: ProcessedTx[]): void {
    if (!txs.length) return;
    const addressMap = {};
    txs.map(({ sender, receiver, tokens = [], status, type }) => {
      if (!addressMap[sender]) {
        addressMap[sender] = { tokens: [FSN_TOKEN], tlTokens: [] };
      }
      if (!addressMap[receiver]) {
        addressMap[receiver] = { tokens: [], tlTokens: [] };
      }
      // Fsn native swap transactions
      if (SWAP_TYPES_IDS.includes(type)) {
        if (status) {
          addressMap[sender].tokens = Array.from(
            new Set([FSN_TOKEN, ...addressMap[sender].tokens, ...tokens]),
          );
          addressMap[sender].tlTokens = Array.from(
            new Set([...addressMap[sender].tlTokens, ...tokens]),
          );
          addressMap[receiver].tokens = Array.from(
            new Set([...addressMap[receiver].tokens, ...tokens]),
          );
          addressMap[receiver].tlTokens = Array.from(
            new Set([...addressMap[receiver].tlTokens, ...tokens]),
          );
        } else {
          addressMap[sender].tokens = Array.from(
            new Set([...addressMap[sender].tokens, FSN_TOKEN]),
          );
        }
        return;
      }
      // time lock transactions
      if (type === TRANSACTION_TYPES['TimeLockFunc'].id) {
        addressMap[sender].tokens = Array.from(
          new Set([FSN_TOKEN, ...addressMap[sender].tokens]),
        );
        if (status) {
          addressMap[sender].tlTokens = Array.from(
            new Set([...addressMap[sender].tlTokens, ...tokens]),
          );
          addressMap[receiver].tlTokens = Array.from(
            new Set([...addressMap[receiver].tlTokens, ...tokens]),
          );
        }
        return;
      }

      // other types of transactions
      if (status) {
        addressMap[sender].tokens = Array.from(
          new Set([FSN_TOKEN, ...addressMap[sender].tokens, ...tokens]),
        );
        addressMap[receiver].tokens = Array.from(
          new Set([...addressMap[receiver].tokens, ...tokens]),
        );
      } else {
        addressMap[receiver].tokens = Array.from(
          new Set([...addressMap[receiver].tokens, FSN_TOKEN]),
        );
      }
    });

    const holdersToUpdate = Object.keys(addressMap).map(address => {
      const { tokens = [], tlTokens = [] } = addressMap[address];
      const record: any = { address };
      if (tokens.length) record.tokens = tokens;
      if (tlTokens.length) record.tlTokens = tlTokens;
      return record;
    });
    this.notify('balance', { pattern: 'balance', data: holdersToUpdate });
  }

  notifyTxDecodingProgress(msg: { block: number }): void {
    this.notify('server', { pattern: 'tx:progress', data: msg });
  }

  notifyTxStats(msg: { txs: number }): void {
    this.notify('server', { pattern: 'tx:count', data: msg });
  }

  notifyL6Txs(msg: ProcessedTx[]): void {
    const txs = msg.slice(0, 6);
    this.notify('server', { pattern: 'tx:l6txs', data: txs });
  }

  notifyTokenGeneration(msg: { tx: string }): void {
    this.notify('token', { pattern: 'token:new', data: msg });
  }

  notifyErc20TokenGenration(msg: { tx: string; timestamp: number }): void {
    this.notify('token', { pattern: 'token:erc20', data: msg });
  }

  notifyTokenChange(msg: { token: string }): void {
    this.notify('token', { pattern: 'token:change', data: msg });
  }

  notifyTokenStats(
    msg: {
      token: string;
      txs: number;
      active_at: number;
      created_at: number;
    }[],
  ): void {
    this.notify('token', { pattern: 'token:txs', data: msg });
  }

  notifyAddressStats(msg: AddressStatsMetadata): void {
    this.notify('address', { pattern: 'address', data: msg });
  }

  notifyAddressSwapsChange(msg: { address: string; count: number }): void {
    this.notify('address', { pattern: 'address:swaps', data: msg });
  }

  notifyAddressInfo(
    msg: {
      address: string;
      exchange?: boolean;
      contract?: boolean;
      erc20?: boolean;
    }[],
  ): void {
    this.notify('address', { pattern: 'address', data: msg });
  }
}
