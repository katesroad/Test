import { Injectable } from '@nestjs/common';
import { WorkerClientService } from './worker-client';
import { ProcessedTx, AddressStatsMetadata } from '../models';
import { SWAP_TYPES_IDS, TRANSACTION_TYPES } from '../common';

@Injectable()
export class NotificationService {
  constructor(private workerClient: WorkerClientService) {}

  // How to handle the condition that the application crashes?
  async makeStatsForTxs(txs: ProcessedTx[]): Promise<void> {
    this.notifyAddressInfo(txs);
    this.notifyTokenInfo(txs);
  }

  private notifyTokenInfo(txs: ProcessedTx[]): void {
    let tokenMap = {};
    txs.map(({ tokens = [], type, hash, age }) => {
      if (type === TRANSACTION_TYPES['AssetValueChangeFunc'].id) {
        this.workerClient.notifyTokenChange({ token: tokens[0] });
      }
      tokens.map(token => {
        if (tokenMap[token]) {
          tokenMap[token].txs += 1;
          tokenMap[token].active_at = Math.max(age, tokenMap[token].active_at);
          tokenMap[token].create_at = Math.min(age, tokenMap[token].create_at);
        } else
          tokenMap[token] = {
            token,
            txs: 1,
            active_at: age,
            create_at: age,
          };
      });
    });

    const msg = [];
    Object.keys(tokenMap).map(token => {
      const tokenStats = tokenMap[token];
      msg.push({ token, ...tokenStats });
      delete tokenMap[token];
    });
    tokenMap = null;
    this.workerClient.notifyTokenStats(msg);
  }

  private notifyAddressInfo(txs: ProcessedTx[]): void {
    let addressMap: Partial<AddressStatsMetadata> = {};
    txs.map(({ sender, receiver, age, data = {}, type }) => {
      if (addressMap[sender]) {
        addressMap[sender].txs += 1;
        addressMap[sender].active_at = Math.max(
          age,
          addressMap[sender].active_at,
        );
        addressMap[sender].create_at = Math.min(
          age,
          addressMap[sender].create_at,
        );
      } else {
        addressMap[sender] = {
          txs: 1,
          active_at: age,
          create_at: age,
        };
      }

      if (data.usan) addressMap[sender].usan = data.usan;

      if (receiver !== sender) {
        if (addressMap[receiver]) {
          addressMap[receiver].txs += 1;
          addressMap[receiver].active_at = Math.max(
            age,
            addressMap[receiver].active_at,
          );
          addressMap[receiver].create_at = Math.min(
            age,
            addressMap[receiver].create_at,
          );
        } else {
          addressMap[receiver] = {
            txs: 1,
            active_at: age,
            create_at: age,
          };
        }
      }
      if (
        type == TRANSACTION_TYPES['TimeLockFunc'].id ||
        SWAP_TYPES_IDS.includes(type)
      ) {
        if (addressMap[sender]) addressMap[sender].countTl = true;
        if (addressMap[receiver]) addressMap[receiver].countTl = true;
      }
    });

    const msg = [];
    Object.keys(addressMap).map(address => {
      const addressData = addressMap[address];
      msg.push({ address, ...addressData });
      delete addressMap[address];
    });
    addressMap = null;
    this.workerClient.notifyAddressInfo(msg);
  }
}
