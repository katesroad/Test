import { Transport } from '@nestjs/microservices';

export const config = (): any => ({
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
    ssl: true,
    pool: { min: 1, max: 2 },
  },

  ['worker:token']: {
    name: 'worker:token',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.token_rabbitmq_url],
      queue: process.env.token_rabbitmq_queue,
      prefetchCount: 1,
      noAck: false,
      queueOptions: {
        durable: true,
      },
    },
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

  redis: {
    name: 'balance',
    host: process.env.redis_host || 'localhost',
    port: process.env.redis_port || 6379,
  },

  // web3 and fusion rpc service
  rpc_url: process.env.rpc_url,
  wss_url: process.env.wss_url,

  app: {
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
});
