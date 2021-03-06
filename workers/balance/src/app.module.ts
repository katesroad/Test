import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

import { config } from './config';
import { TokenModule, TokenService } from './token';
import { PgService, PgModule } from './pg';
import { RedisHelperModule } from './redis-helper';
import { WorkerClientModule } from './worker-client/worker-client.module';
import { MongoModule } from './mongo/mongo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    HttpModule.register({
      timeout: 5000,
    }),
    PgModule,
    TokenModule,
    RedisHelperModule,
    WorkerClientModule,
    MongoModule,
  ],
  controllers: [AppController],
  providers: [AppService, TokenService, PgService],
  exports: [AppService],
})
export class AppModule {}
