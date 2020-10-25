import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { TokensHoldersQueryDto, tokenSort } from './tokens-holders-query.dto';
import { validate } from 'class-validator';

@Injectable()
export class TokenHoldersQueryPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') return value;

    const object = plainToClass(TokensHoldersQueryDto, value);
    const errors = await validate(object);
    if (errors.length) {
      throw new BadRequestException(JSON.stringify(errors));
    }

    const { page = 0, size = 100, sort = tokenSort.qty } = object;
    if (page * size > 1000) {
      const msg = 'We only provide top 1000 holders for a token.';
      throw new BadRequestException(msg);
    }

    return { page, size, sort };
  }
}
