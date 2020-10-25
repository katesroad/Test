import { QueryCmdDto } from './query-cmd.dto';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryTokensCmdDto extends QueryCmdDto {
  @IsNumber()
  @Transform(val => {
    const type = parseInt(val);
    if (type === 0) return 0;
    else return 1;
  })
  @IsOptional()
  type?: number;

  @IsString()
  @Transform(val => {
    const sort = val ? val.trim() : 'qty';
    const sortOptions = ['qty', 'qty_in', 'qty_own'];
    if (sortOptions.includes(sort)) return sort;
    else return 'qty';
  })
  @IsOptional()
  sort?: string;
}
