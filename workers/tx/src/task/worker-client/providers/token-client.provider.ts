import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';

export const TOKEN_SERVICE_NAME = 'TOKEN_CLIENT';

export const TOKEN_CLIENT_PROVIDER = {
  provide: TOKEN_SERVICE_NAME,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): any => {
    const option = configService.get('worker:token');
    return ClientProxyFactory.create(option);
  },
};
