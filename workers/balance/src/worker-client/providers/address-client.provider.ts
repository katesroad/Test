import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory } from '@nestjs/microservices';

export const ADDRESS_SERVICE_NAME = 'ADDRESS_CLIENT';

export const ADDRESS_CLIENT_PROVIDER = {
  provide: ADDRESS_SERVICE_NAME,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): any => {
    const option = configService.get('worker:address');
    return ClientProxyFactory.create(option);
  },
};
