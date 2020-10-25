import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class HashPipe implements PipeTransform {
  constructor(private readonly type: string) {}
  transform(value: string, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param') return value;

    const type = this.type;
    const hash = value.trim();

    const reg = /^0x([A-Fa-f0-9]{64})$/;
    const contractReg = /^0x([A-Fa-f0-9]{40})$/;

    if (type === 'token') {
      const isValid = reg.test(hash) || contractReg.test(hash);
      if (isValid) return hash.toLowerCase();
    }

    if (reg.test(hash)) return value.toLowerCase();

    throw new BadRequestException(`${value} is not a valid ${type} hash.`);
  }
}
