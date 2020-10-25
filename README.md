# fsn365.com

[https://fsn365.com](https://fsn365.com)

fsn365.com is a tool for viewing transactions, addresses, and blocks in the fusion blockchain platform in an average user-friendly way.

## Disclaimer

There is no guarantee for data accuracy, including wallet balance updating on time as the EFSN node or MongoDB may crash due to low-performance VPS for 
some reasons:

>1. Using HHD EBS storage may encounter block stuck  or network latency
>2. Reading transactions from MongoDB eats a lot of memory
>3. EFSN node may hang out a socket for lower specs with high possibility, which results in a balance update to be failed or having long latency.

Also, the transaction count of an address/token might not be accurate, neither as the current version has not touched the reliability of the RabbitMQ part yet. For more information about RabbitMQ reliability, please refer to [https://www.rabbitmq.com/reliability.html](https://www.rabbitmq.com/reliability.html).

The lowest specs for running services is
- 4 CPU
- 8 GB memory
- 160 GB SSD storage.

Also, you can use the RDS provider for PostgreSQL, MongoDB, and RabbitMQ to enhance the accuracy and stability, if you have no idea how to config them locally on your VPS.

## Components

### workers

The workers periodically read the transactions synchronized by [mongosync](https://github.com/fsn-dev/fsn-go-sdk/tree/master/mongosync) and decode it. A server/workers model is used with RabbitMQ being used as a work queue. Once data processed, the information is stored in PostgreSQL, which serves as the primary database for addresses, decoded transactions, fusion native swaps, addresses' token balances(erc20 standard tokens and fusion native tokens).

All the workers are facilitated by [nestjs](http://nestjs.com/) microservices.

### Backend

The backend is a Nestjs application that mainly serves as a shim to the PostgreSQL database and MongoDB(for block collection only). It serves the API used by the frontend.


### Frontend

The frontend is a single-page application(using [Vue.js](https://vuejs.org/)) that provides users with access to the site's data via data tables. The UI framework used for the frontend is [quasar](https://quasar.dev/) mainly.


## Installation

### Install fusion node and fsn-go-sdk

We will need to install [efsn node](https://github.com/FUSIONFoundation/efsn/wiki/Wallet-development-guide) and [mongosync](https://github.com/fsn-dev/fsn-go-sdk/tree/master/mongosync) for feeding the blockchain data to data processing workers. For the above two applications, installing MongoDB and Go as prerequisites.

### Install Redis, PostgreSQL, RabbitMQ, Node

The backend and all the workers and use Nest.js version 7.5.x, the recommendation of the Node LTS version is 14.x.

Workers use **Redis** as a cache layer for storing some frequent and latest used vital data, and **PostgreSQL** is the primary database to store processed data. Message distributions and queues facilitated by **RabbitMQ**.

Using RDS service and elastic cache provided by AWS is recommended for more reliable service; RabbitMQ service recommendation is [www.cloudamqp.com](https://www.cloudamqp.com/).

All the workers and backend use .env file to set environment variables; 
please copy .env.sample as .env to configure the environments based on  needs.

All the workers are Nest.js microservice instances. Please follow [Nest.js configure document ](https://docs.nestjs.com/techniques/configuration) to understand how the configuration works if you still have configuration issues.

### Start workers

All the workers and the backend server must be started before running the tx processing worker.

The steps to start workers

- install dependencies

 npm install

 npm audit fix

- compile file

npm run build

- start worker/server

pm2 start ecosystem