import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Hybrid app to get websocket data
  app.connectMicroservice<MicroserviceOptions>(config.get('service:web3'));
  await app.startAllMicroservicesAsync();

  await app.listen(config.get('worker:block').port, () => {
    console.log(`worker:block started.`);
  });
}
bootstrap();
