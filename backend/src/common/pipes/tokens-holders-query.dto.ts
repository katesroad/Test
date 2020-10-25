import { PageQueryDto } from './page-query.dto';
import { IsOptional, IsEnum, IsNumber, contains } from 'class-validator';
import { Transform } from 'class-transformer';

export enum tokenSort {
  'qty' = 'qty',
  'qty_in' = 'qty_in',
  'qty_own' = 'qty_own',
}

export class TokensHoldersQueryDto extends PageQueryDto {
  @IsEnum(tokenSort)
  @Transform(val => {
    let sort = val && (val as string).trim();
    if (!sort) return tokenSort.qty;
    if (tokenSort[sort]) return tokenSort[sort];
    return tokenSort.qty;
  })
  @IsOptional()
  sort?: string;

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

  @IsNumber()
  @Transform(val => {
    let page: number = Math.abs(parseInt(val));
    if (isNaN(page)) return 0;
    if (page < 0) page = 0;
    return page;
  })
  page?: number;
}
