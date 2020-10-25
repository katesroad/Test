import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from 'nestjs-redis';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { MongoModule } from './mongo/mongo.module';
import { config } from './config';
import { WorkerClientModule } from './worker-client/worker-client.module';
import { RedisHelperModule } from './redis-helper';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    MongoModule,
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('redis'),
    }),
    ScheduleModule.forRoot(),
    MongoModule,
    WorkerClientModule,
    RedisHelperModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
