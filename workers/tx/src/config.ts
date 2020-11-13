import { Transport } from '@nestjs/microservices';
import { Web3Server } from './services';

export const config = () => ({
  postgres: {
    connection: {
      host: process.env.db_host,
      port: process.env.db_port,
      user: process.env.db_username,
      password: process.env.db_password,
      database: process.env.db_name,
    },
    searchPath: ['public'],
    client: 'pg',
    pool: { max: 2, min: 1 },
  },

  mongodb: {
    uri: process.env['mongo_uri'],
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  redis: {
    name: 'tx',
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

  ['worker:token']: {
    name: 'worker:token',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.asset_rabbitmq_url],
      queue: process.env.asset_rabbitmq_queue,
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

  'worker:server': {
    transport: Transport.TCP,
    options: {
      port: +process.env.server_port,
    },
  },

  'worker:tx': {
    name: 'worker:tx',
    port: process.env.app_port || 8888,
  },

  ['service:web3']: {
    strategy: new Web3Server(process.env.wss_url),
  },

  rpcServer: process.env.rpc_url,

  wss_url: process.env.wss_url,
});
