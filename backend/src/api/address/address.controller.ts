import {
  Controller,
  Get,
  Param,
  CacheTTL,
  Query,
  UsePipes,
  CacheInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { AddressPipe } from './address.pipe';
import { AddressService } from './address.service';
import {
  AddressId,
  IAddress,
  IAddressAsset,
  IAddressTlAsset,
  ITxs,
} from '../../models';
import { QueryCmdDto, QueryCmdPipe } from '../../common';

@Controller('address')
@UseInterceptors(CacheInterceptor)
export class AddressController {
  constructor(private readonly service: AddressService) {}

  @Get('names')
  @CacheTTL(200)
  getLabeledAddresses(): Promise<object> {
    return this.service.getLabeledAddresses();
  }

  @Get(':address')
  @CacheTTL(4)
  getAddressOverview(
    @Param('address', AddressPipe) address: AddressId,
  ): Promise<IAddress> {
    return this.service.getAddressOverview(address);
  }

  @Get(':address/tokens')
  @CacheTTL(4)
  getAdressFusionTokens(
    @Param('address', AddressPipe) address: AddressId,
  ): Promise<IAddressAsset[]> {
    return this.service.getAdressFusionTokens(address);
  }

  @Get(':address/tltokens')
  @CacheTTL(4)
  getAddressTlTokens(
    @Param('address', AddressPipe) address: AddressId,
  ): Promise<IAddressTlAsset[]> {
    return this.service.getAddressTlTokens(address);
  }

  @Get(':address/erc20s')
  @CacheTTL(4)
  getAddressErc20Tokens(
    @Param('address', AddressPipe) address: AddressId,
  ): Promise<IAddressAsset[]> {
    return this.service.getAddressErc20Tokens(address);
  }

  @Get(':address/txs')
  @CacheTTL(1300)
  @UsePipes(QueryCmdPipe)
  getAddressTxs(
    @Param('address', AddressPipe) address: AddressId,
    @Query() query: QueryCmdDto,
  ): Promise<ITxs> {
    console.log(address, query);
    return this.service.getAddressTxs(address, query);
  }

  @Get(':address/swaps')
  @CacheTTL(13)
  getAddressSwaps(@Param('address', AddressPipe) address: AddressId) {
    return this.service.getAddressNativeSwaps(address);
  }
}
