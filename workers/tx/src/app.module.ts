import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './task';
import { HelperModule } from './helper';
import { ConfigModule } from '@nestjs/config';
import { config } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TaskModule,
    HelperModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
