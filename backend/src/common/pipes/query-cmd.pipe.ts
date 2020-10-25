import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { QueryCmdEnum, QueryCmdDto } from './query-cmd.dto';
import { validate } from 'class-validator';

@Injectable()
export class QueryCmdPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query') return value;
    const object = plainToClass(QueryCmdDto, value);

    const errors = await validate(object);
    if (errors.length) throw new BadRequestException(JSON.stringify(errors));

    let { anchor, size = 10, cmd = QueryCmdEnum.first, ...others } = object;

    const query: QueryCmdDto = { ...others, size };
    if (!query.sort) delete query.sort;

    if (anchor === undefined) {
      cmd = cmd === 'last' ? cmd : (cmd = QueryCmdEnum.first);
    }

    query.cmd = cmd;

    if (cmd === QueryCmdEnum.next || cmd === QueryCmdEnum.prev) {
      query.anchor = anchor;
    }

    return query;
  }
}
