drop table if exists token_holders;
create table token_holders (
  token varchar(66) not null,
  address char(44) not null,
  qty    text default '0',
  qty_in text default '0',
  qty_own text default '0',
  token_type int not null,
  -- for timelock tokens
  data json default null,
  primary key(address, token)
);

-- token metadata
drop table if exsits tokens;
create table tokens (
  id serial unique primary key,
  hash varchar(66) unique not null,
  name text  not null,
  symbol text not null,
  qty text not null,
  precision  int not null,
  -- reduce limitation
  issuer char(42) default null,
  -- reduce limitation
  issue_tx char(66) default null,
  created_at text not null,
  active_at  text not null,
  canchange boolean not null,
  verified boolean default false,
  -- for native token
  info json   default null
);

drop table if exsits token_stats;
create table token_stats (
  token  varchar(66)  primary key,
  -- transactions
  txs  text default 0,
  -- erc20 transfers
  transfers text default 0,
  dex_swaps  text default 0,
  pair_add text default 0,
  pair_rm   text default 0
)