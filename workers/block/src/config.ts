import { Transport } from '@nestjs/microservices';
import { Web3Server } from './services';

export const config = () => ({
  mongodb: {
    uri: process.env['mongo_uri'],
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  redis: {
    name: 'block',
    host: process.env.redis_host || 'localhost',
    port: process.env.redis_port || 6379,
  },

  ['worker:address']: {
    name: 'worker:address',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.address_rabbitmq_url],
      queue: process.env.address_rabbitmq_queue,
      prefetchCount: 1,
      noAck: false,
      queueOptions: {
        durable: true,
      },
    },
  },

  ['worker:balance']: {
    name: 'worker:balance',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.balance_rabbitmq_url],
      queue: process.env.balance_rabbitmq_queue,
      prefetchCount: 1,
      noAck: false,
      queueOptions: {
        durable: true,
      },
    },
  },

  ['service:web3']: {
    strategy: new Web3Server(process.env.wss_url),
  },

  ['worker:block']: {
    name: 'worker:block',
    port: process.env.app_port || 8889,
  },
});
