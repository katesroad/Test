import { IsNumber, IsOptional, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum orderEnum {
  'desc' = 'desc',
  'asc' = 'asc',
}

export class PageQueryDto {
  @IsNumber()
  @Transform(val => {
    const page = parseInt(val);
    if (isNaN(page) || page < 0) return 0;
    return page;
  })
  @IsOptional()
  page?: number;

  @IsNumber()
  @Transform(val => {
    const size = parseInt(val);
    if (isNaN(size) || size < 0) return 10;
    return size;
  })
  @IsOptional()
  size?: number;

  @IsEnum(orderEnum)
  @Transform(val => {
    const order = val && val.trim().toLowerCase();
    return orderEnum[order] || orderEnum.desc;
  })
  @IsOptional()
  order?: string;

  @IsString()
  @IsOptional()
  sort?: string;
}
