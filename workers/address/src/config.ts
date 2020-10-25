import { Transport } from '@nestjs/microservices';

export const config = () => ({
  postgres: {
    client: 'pg',
    connection: {
      host: process.env.db_host,
      port: process.env.db_port,
      user: process.env.db_username,
      password: process.env.db_password,
      database: process.env.db_name,
    },
    searchPath: ['public'],
    pool: {
      min: 1,
      max: 2,
    },
  },

  redis: {
    name: 'address',
    host: process.env.redis_host || 'localhost',
    port: +process.env.redis_port || 6379,
  },

  // used to count address timelock token balance
  // avoid saving address_tl_balance
  rpcUrl: process.env.rpc_url || 'http://localhost:9001',

  app: {
    name: 'worker:address',
    transport: Transport.RMQ,
    options: {
      urls: [process.env.address_rabbitmq_url],
      queue: process.env.address_rabbitmq_queue,
      prefetchCount: 1,
      noAck: false,
      queueOptions: { durable: true },
    },
  },
});
