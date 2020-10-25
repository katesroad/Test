import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class PgConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions() {
    console.log(this.configService.get('typeorm'));
    const config = this.configService.get('tyeporm');
    return config;
  }
}
