import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum QueryCmdEnum {
  next = 'next',
  prev = 'prev',
  last = 'last',
  first = 'first',
}
export enum QueryOrderEnum {
  desc = 'desc',
  asc = 'asc',
}

export class QueryCmdDto {
  @IsEnum(QueryCmdEnum)
  @IsOptional()
  cmd?: string;

  @IsNumber()
  @Transform(val => {
    let size: number = Math.abs(parseInt(val));
    if (isNaN(size)) return 10;
    if (size > 100) size = 100;
    if (size < 10) size = 10;
    return size;
  })
  @IsOptional()
  size?: number;

  @IsString()
  @Transform(val => {
    if (val === undefined) return '';
    let sort = (val as string).trim();
    if (sort === QueryOrderEnum.asc || sort == QueryOrderEnum.desc) return '';
    return sort;
  })
  @IsOptional()
  sort?: string;

  @IsNumber()
  @Transform(val => {
    const anchor = Math.abs(val);
    if (isNaN(anchor)) return;
    return anchor;
  })
  @IsOptional()
  anchor?: number;
}
