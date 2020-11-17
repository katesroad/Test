# Balance Services

## Exposured Interfaces
Please `Please refer app.controller.ts` 

### Interaction with other workers

- Notify token worker to update token's holders count

## Functionality

- track address balances change

- Notify token worker to update holder's count

- Notify address worker to update holding token's types change

## How to start services

- npm install
- npm run build
- config *.env* file(please follow sample.env)
- pm2 start ecosystem

It will start a cluster of process at max value.

