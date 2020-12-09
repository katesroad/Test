pm2 delete all

cd backend
pm2 start ecosystem.config.js


cd ../workers/balance
pm2 start ecosystem.config.js


cd ../token
pm2 start ecosystem.config.js


cd ../address
pm2 start ecosystem.config.js



cd ../tx

