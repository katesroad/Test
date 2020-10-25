import { Injectable } from '@nestjs/common';
import { PgAddressService, PgTxsService, PgSwapsService } from '../../shared';
import { QueryCmdDto } from '../../common';
import {
  AddressId,
  IAddress,
  IAddressTlAsset,
  IAddressAsset,
  ITxs,
} from '../../models';

@Injectable()
export class AddressService {
  constructor(
    private address: PgAddressService,
    private tx: PgTxsService,
    private swap: PgSwapsService,
  ) {}

  async getLabeledAddresses(): Promise<any> {
    return this.address.getLabeledAddresses();
  }

  async getAddressOverview(addressId: AddressId): Promise<IAddress> {
    const address: string = await this.getAddressHash(addressId);
    return this.address.getAddressOverview(address);
  }

  async getAdressFusionTokens(addressId: AddressId): Promise<IAddressAsset[]> {
    const address: string = await this.getAddressHash(addressId);
    return this.address.getAdressFusionTokens(address);
  }

  async getAddressTlTokens(addressId: AddressId): Promise<IAddressTlAsset[]> {
    const address: string = await this.getAddressHash(addressId);
    return this.address.getAddressTlTokens(address);
  }

  async getAddressErc20Tokens(addressId: AddressId): Promise<IAddressAsset[]> {
    const address: string = await this.getAddressHash(addressId);
    return this.address.getAdressErc20Tokens(address);
  }

  async getAddressTxs(addressId: AddressId, query: QueryCmdDto): Promise<ITxs> {
    const address: string = await this.getAddressHash(addressId);
    const getTxs = this.tx.getAddressTxs(address, query);
    const getTxsCount = this.address.getAddressStats(address);
    return Promise.all([getTxs, getTxsCount]).then(data => {
      const [txs, txsStats] = data;
      return { txs, total: txsStats.txs };
    });
  }

  async getAddressNativeSwaps(addressId: AddressId): Promise<any[]> {
    const address: string = await this.getAddressHash(addressId);
    return this.swap.getOwnersSwaps(address);
  }

  private async getAddressHash(addressId: AddressId): Promise<string> {
    if (typeof addressId === 'string') return addressId;
    return this.address.getAddressHashByUSAN(addressId);
  }
}
