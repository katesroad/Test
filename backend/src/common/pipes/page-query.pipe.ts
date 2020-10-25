import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { PageQueryDto, orderEnum } from './page-query.dto';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class PageQueryPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') return value;

    const object = plainToClass(PageQueryDto, value);
    const errors = await validate(object);
    if (errors.length) {
      throw new BadRequestException(JSON.stringify(errors));
    }

    const {
      page = 0,
      size = 10,
      order = orderEnum.desc,
      sort = '',
      ...others
    } = object;
    if (size > 500) {
      throw new BadRequestException(`The maxium size is 100.`);
    }
    const query: PageQueryDto = { ...others, page, size, order };
    if (sort.trim().length) query.sort = sort;

    return query;
  }
}
