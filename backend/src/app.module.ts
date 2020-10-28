import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import * as redisStore from 'cache-manager-redis-store';
import { ApiModule } from './api/api.module';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { config } from './config';
import { SharedModule } from './shared';

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
export class AppModule { }
