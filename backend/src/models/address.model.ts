export interface IAddressFsnBalance {
  fsn?: number;
  fsnOwn?: number;
  fsnIn?: number;
}

export interface IAddress extends IAddressFsnBalance {
  address: string;
  usan?: number;
  label?: string;
  type: number;
}

export type AddressId = string | number;

export interface IAddressAsset {
  asset: string;
  symbol: string;
  qty: number;
  qtyIn: number;
  qtyOwn: number;
}

export interface IAddressTlAsset {
  asset: string;
  data: object;
  symbol: string;
}
