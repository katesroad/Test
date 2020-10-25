import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';

export const SERVER_SERVICE_NAME = 'SERVER_CLIENT';

export const SERVER_CLIENT_PROVIDER = {
  provide: SERVER_SERVICE_NAME,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): any => {
    const option = configService.get('worker:server');
    return ClientProxyFactory.create(option);
  },
};
