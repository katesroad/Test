import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { AddressId } from '../../models';

@Injectable()
export class AddressPipe implements PipeTransform {
  transform(value: AddressId, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param') return value;

    // hash
    const hashReg = /^0x([A-Fa-f0-9]{40})$/;
    if (value && hashReg.test(value as string))
      return (value as string).toLowerCase();

    // usan
    const usanReg = /^[1-9]{1}[0-9]{2,}$/;
    if (usanReg.test(value as string)) return +value;

    throw new BadRequestException(`Address ${value} is invalid.`);
  }
}
