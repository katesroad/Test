# Block Worker

## Configure

After setting up enviroment varibles at *.env* at root directory,
program reads the configure from *process.env*.

The configure reading file is [config.ts](./src/config.ts).

## Functionalities
- Track miners from *Blocks* collection
- Notify Balance worker to update miner's FSN balance
- Notify Address worker that an address is a miner


## Interaction with other workers
- Notify Balance worker to update miner's FSN balance
- Notify Address worker that an address is a miner

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