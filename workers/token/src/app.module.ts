import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';
import { AppController } from './app.controller';
import { RedisHelperModule } from './redis-helper/redis-helper.module';
import { PgModule } from './pg/pg.module';
import { TokenModule } from './token';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    PgModule,
    RedisHelperModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppService],
})
export class AppModule {}
