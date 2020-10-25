# Tables stored in PostgreSQL


- **tokens**

None smart contract token issued on fusion blockchain

| Name      | Type    |     constraints |
| ------    | ------  | --------------- |
|id         | serial  | primary key     |
|hash       | char(66)| unique not null |
|name       | text    | unique not null |
|symbol     | text    | not null        |
|qty        | char(66)| text            |
|precision  | numeric | not null        |
|issuer     | char(42)| not null        |
|issue_time | int     | not null        |
|issue_tx   | char(66)| not null        |
|canchange  | boolean | not null        |
|verified  | boolean |                 |
|holders    | int     | default 0       |
|txs        | int     | default 0       |
|info       | json    | default null    |


- **erc20**

Token issued by smart contract on fusion blockchain.

| Name      | Type    |     constraints |
| ------    | ------  | --------------- |
|id         | serial  | primary key     |
|hash       | char(42)| unique not null |
|name       | text    | unique not null |
|symbol     | text    | not null        |
|qty        | text    | not null        |
|precision  | numeric | not null        |
|verified  | boolean |                 |
|holders    | int     | default 0       |
|txs        | int     | default 0       |
|info       | json    | default null    |



- **address**

Blockchain address on fusion blockchain.

| Name      | Type    |     constraints |
| ------    | ------  | --------------- |
|id         | serial  | primary key     |
|hash       | char(42)| unique not null |
|label      | text    | unique not null |
|miner      | boolean | default false   |
|erc20      | boolean | default false   |
|usan       | int     | default null    |
|create_at  | int     | not null        |
|active_at  | int     | not null        |
|txs        | int     | default 0       |
|info       | json    | default null    |


- **address_tokens**

None smart contract token balance for address on fusion blockchain.

| Name      | Type    |     constraints |
| ------    | ------  | --------------- |
|token      | char(66)| not null        |
|address    | char(42)| not null        |
|qty        | int     | default 0       |
|qty_in     | int     | default 0       |

- **address_tl_tokens**

None smart contract token timelock balance for address on fusion blockchain.

| Name      | Type    | constraints                  |
| ------    | ------  | -------------------          |
|token      | char(66)| not null, primary key        |
|address    | char(42)| not null, primary key        |
|data       | json    | not null                     |


- **address_erc20_tokens**

Smart contract token balance for address on fusion blockchain.

| Name      | Type    |     constraints        |
| ------    | ------  | ---------------        |
|token      | char(42)| not null, primary key  |
|address    | char(42)| not null,primary  key  |
|qty        | int     | not null               |


- **txs**

Processed transactions from [fsn go sdk](https://github.com/fsn-dev/fsn-go-sdk) on fusion blockchain.

| Name      | Type    |     constraints |
| ------    | ------  | --------------- |
|id         | serial  | primary key     |
|hash       | char(66)| unique not null |
|status     | int     | not null        |
|block      | int     | not null        |
|type       | int     | not null        |
|sender     | char(42)| not null        |
|receiver   | char(42)| not null        |
|tokens     | jsonb   | default null    |
|data       | json    | default false   |
|timestamp  | int     | default null    |


- **erc20_txs**

Processed erc20 transactions from [fsn go sdk](https://github.com/fsn-dev/fsn-go-sdk) on fusion blockchain.

| Name      | Type    |     constraints |
| ------    | ------  | --------------- |
|id         | serial  | primary key     |
|hash       | char(66)| unique not null |
|status     | int     | not null        |
|block      | int     | not null        |
|type       | int     | not null        |
|sender     | char(42)| not null        |
|receiver   | char(42)| not null        |
|tokens     | jsonb   | default null    |
|data       | json    | default false   |
|timestamp  | int     | default null    |


- **txs_stats**

Transactions statistic data. It is in one day a round.

| Name      | Type    |     constraints |
| ------    | ------  | --------------- |
|id         | serial  | primary key     |
|stats_at   | int     | unique not null |
|stats      | json    | not null        |
