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
    ssl: true,
  },

  typeorm: {
    type: 'postgres',
    host: process.env.db_host,
    port: process.env.db_port,
    username: process.env.db_username,
    password: process.env.db_password,
    database: process.env.db_name,
    synchronize: false,
    entities: ['dist/db/pg/entities/tx.entity.js'],
  },
  mongodb: {
    uri: process.env['mongo_uri'],
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  app: {
    name: 'app',
    port: +process.env['server_port'] || 3800,
  },

  cors: {
    origin: [...process.env.cors_domain.split(',')],
    optionsSuccessStatus: 204,
  },

  redis: {
    name: 'server',
    host: process.env.redis_host || 'localhost',
    port: process.env.redis_port || 6379,
    ttl: 4,
  },

  rpc: process.env.rpc_url,

  ['service:web3']: {
    strategy: new Web3Server(process.env.wss_url),
  },

  ['service:tcp']: {
    transport: Transport.TCP,
    options: {
      port: +process.env.tcp_port,
    },
  },
});
