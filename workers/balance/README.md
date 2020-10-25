# Balance Services

## Exposured Interfaces

- balance
  - usage: Update address token's balance
  - msg format
  ```ts
  export class TxBalanceMsg {
    s: string;
    r?: string;
    tokens?: string[];
  }
  ```
- tl_balance
  - usage: Update address timelock token's balance
  - msg format
  ```ts
  export class TxBalanceMsg {
    s: string;
    r?: string;
    tokens?: string[];
  }
  ```

### Interaction with other workers

- Notify token worker to update token's holders count

## Functionality

- update address timelock tokens' balance on table *address_tl_tokens*

- update address tokens' balance on table *address_tokens*

- update address address erc20 tokens' balance on table *address_erc20_tokens*

- Notify token worker to update holder's count

## How to start services

- npm install
- npm run build
- config *.env* file(please follow sample.env)
- pm2 start ecosystem

It will start a cluster of process at max value.

