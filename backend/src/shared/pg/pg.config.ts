import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KnexModuleOptionsFactory } from 'nestjs-knex';

@Injectable()
export class PgConfig implements KnexModuleOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createKnexModuleOptions() {
    const config = this.configService.get('postgres');
    return { config };
  }
}
