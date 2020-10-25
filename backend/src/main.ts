import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as rateLimit from 'express-rate-limit';
import { ResponseInterceptor } from './common/interceptors';
import { CatchAllFilter } from './common/filters';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new CatchAllFilter());

  const config = app.get(ConfigService);

  // Hybrid app to get websocket data
  app.connectMicroservice<MicroserviceOptions>(config.get('service:web3'));
  app.connectMicroservice<MicroserviceOptions>(config.get('service:tcp'));
  await app.startAllMicroservicesAsync();

  app.use(
    rateLimit({
      windowMs: 1 * 1000,
      max: 10,
    }),
  );

  const { port = 8080, name } = config.get('app');

  await app.listen(port, async () => {
    const logger = new Logger(name);
    logger.log(`${name} started at url:${await app.getUrl()}\n`);
  });
}
bootstrap();
