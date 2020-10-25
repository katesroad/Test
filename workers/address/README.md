# Fusion Address Worker

## Functionality

- track address information including
  - active_at: latest active time
  - create_at: first active time
  - txs: transaction numbers from or to this address
  - fusion_tokens: how many native tokens this address holds
  - erc20_tokens: how many erc20 tokens this address holds
  - tl: how many time lock tokens this address holds
  - miner: is this address a mining address?
  - erc20: is this address an erc20 token contract address
  - contract: is this address an contract address
  - swaps: how many active swaps this address still has

## Message supported

- address
  - usage: tracking address information including
    - active_at
    - create_at
    - txs
    - miner
    - erc20
    - contract
- address:holdings
  -usage: tracking address token holdings information including
    - fusion_tokens: how many native tokens this address holds
    - erc20_tokens: how many erc20 tokens this address holds
    - tl: how many time lock tokens this address holds
- address: swaps  
  - usage: track address active swaps amount(the address is a swap owner, not a taker);

## How to start service

- install dependencies

```bash
npm install
```

- build file

```bash
npm run build
```

- start service

```bash
pm2 start ecosystem
```