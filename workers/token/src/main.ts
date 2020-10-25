import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { config } from './config';

async function bootstrap() {
  const CONFIG = config();
  const { name, ...rabbitConfig } = CONFIG.app;
  const logger = new Logger(name);

  const app = await NestFactory.createMicroservice(AppModule, rabbitConfig);

  const msg = `\n\n
=========================================================
        ${CONFIG.app.name} started
=========================================================
    `;
  await app.listen(() => {
    logger.log(msg);
  });
}
bootstrap();
