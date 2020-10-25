import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';

export const BALANCE_SERVICE_NAME = 'BALANCE_CLIENT';

export const BALANCE_CLIENT_PROVIDER = {
  provide: BALANCE_SERVICE_NAME,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): any => {
    const option = configService.get('worker:balance');
    return ClientProxyFactory.create(option);
  },
};
