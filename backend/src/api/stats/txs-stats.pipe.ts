import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';

import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { TxsStatsQueryDto } from '../../models';

@Injectable()
export class TxsStatsPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') return value;

    const object = plainToClass(TxsStatsQueryDto, value);
    const errors = await validate(object);
    if (errors.length) {
      throw new BadRequestException(JSON.stringify(errors));
    }
    const { from, to } = object;
    return { from: this.calcTime(from), to: this.calcTime(to) };
  }

  private calcTime(time: number): number {
    const now = Date.now() / 1000;
    if (time) {
      time = Math.min(now, time);
      time = Math.max(0, time);
    } else {
      time = now;
    }
    return parseInt(time + '');
  }
}
