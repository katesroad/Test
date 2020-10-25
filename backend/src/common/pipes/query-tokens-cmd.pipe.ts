import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { QueryCmdPipe } from './query-cmd.pipe';

@Injectable()
export class QueryTokensCmdPipe extends QueryCmdPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    const query = await super.transform(value, metadata);
    const { type = 0, ...others } = query;
    return { type: +type, ...others };
  }
}
