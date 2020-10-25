import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { AppController } from './app.controller';
import { PgModule } from './pg';
import { RpcModule } from './rpc/rpc.module';
import { RedisHelperModule } from './redis-helper/redis-helper.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    PgModule,
    RpcModule,
    RedisHelperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
