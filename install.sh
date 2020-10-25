# kill origin one
pm2 delete all

# clean message queue
rabbitmqctl purge_queue address_mainnet

rabbitmqctl purge_queue token_mainnet

rabbitmqctl purge_queue balance_mainnet

# redis cache
redis-cli flushall

# start server application

cd server
# check enviroment setting
cat .env
npm run build
pm2 start ecosystem.config.js


# start address processing worker
cd ../workers/address
cat .env
npm run build
pm2 start ecosystem.config.js

# start address token worker
cd ../token
cat .env
npm run build
pm2 start ecosystem.config.js

# start address balance worker
cd ../balance
cat .env
npm run build
pm2 start ecosystem.config.js


# start address tx worker
cd ../tx
cat .env
npm run build
pm2 start ecosystem.config.js

