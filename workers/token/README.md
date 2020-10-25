# Fusion Token Services

## Functionality

- track token(none smart contract) generation on fusion blockchain
- track token(none smart contract) issue amount changes
- store token key information - *symbol*, *precision* for transaction decode usage.
  - none smart contract token
  - erc20 token
- statistic tokens' information
  - transactions' count
  - holders' count

## Exposured interfaces

- token:txs
  - usage: statistic tokens' transaction count
  - interface format
  ```ts
  export class TokenTxsCountMsg {
    token: string;
    txs: number;
  }
  ```
- token:holders
  - usage: statistic tokens' holders count
  - interface format
  ```ts
  export class TokenHoldersCountMsg {
    token: string;
    count: number; 
  }
  ```
- token:new
  - usage: track newly generated none smart contract token on fusion blockchain
  - message format
  ```ts
  export class TokenGenerationMsg {
    tx: string;
  }
  ```
- token:change
  - usage: track none smart contract token issue quantity change
  - message format
  ```ts
  export class TokenChangeMsg {
    token: string;
  }
  ```
- token:erc20
  - usage: to track erc20 tokens on fusion network
  - message format
  ```ts
  export class TokenErc20Msg {
    contract: string;
  }
  ```

## How to start service

- install dependencies

```bash
npm install
```

- build file

```bash
npm run build
```
- config service by following env sample file

```
rpc_url = rpc_url

db_host = host
db_port = port
db_username = username 
db_password = password
db_name = db_name

mongo_uri  = mongodb://username:password@host:port/db


asset_rabbitmq_url = amqp://username:password@host:port
asset_rabbitmq_queue = queque_name

```
- start service
```bash
pm2 start ecosystem
```