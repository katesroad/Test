import * as redisStore from 'cache-manager-redis-store';
import { Module, CacheModule, CacheInterceptor } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { config } from './config';
import { SharedModule } from './shared';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { DbModule } from './db/db.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        ...config.get('redis'),
      }),
    }),
    SharedModule,
    ApiModule,
    DbModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    AppGateway,
  ],
  controllers: [AppController],
})
export class AppModule {}
