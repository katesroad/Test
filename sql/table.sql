drop view if exists fusion_token_holders_view;
drop view if exists erc20_token_holders_view;
drop view if exists address_txs_view;
drop view if exists address_tokens_view;
drop view if exists address_erc20_tokens_view;
drop view if exists address_tl_tokens_view;
drop view if exists address_overview_view;
drop view if exists tokens_view;
drop view if exists erc20_tokens_view;
drop table if exists tx_token;

drop table if exists tokens;
create table tokens(
  id          serial      primary key,
  hash        varchar(66)    unique not null,
  name        text        not null,
  symbol      text        not null,
  qty         text        not null,
  precision   numeric     not null,
  issuer      char(42)    not null,
  create_at   int         not null,
  active_at   int         default null,
  issue_tx    char(66)    not null,
  canchange   boolean     default null,
  verified    boolean     default false,
  holders     int         default 0,
  txs         int         default 0,
  -- 0, native token, 1: erc20 token
  token_type  int         not null, 
  info        json        default null
);

-- FSN Token
insert into tokens(hash, name, symbol, qty, precision, issuer, create_at, issue_tx, canchange, verified, token_type)
values('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'FUSION', 'FSN', 81920000, 18, '0x0000000000000000000000000000000000000000', 1561894626,'0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', false, true,0);
-- add invalid token
insert into tokens(hash, name, symbol, qty, precision, issuer, create_at, issue_tx, canchange, verified, token_type)
values('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe', 'FUSION', 'FSN', 81920000, 18, '0x17f4ebba92bce9f1760d3e4b7b371c7dac1fc822', 1563892588,'0xd67997afda747c618f6574e48569735c2a958ef0948297b09cc752b8f860c9d0', false, true,0);


drop table if exists address;

create table address (
  id         serial          primary key,
  hash          char(42)        unique not null,
  label         text            default null,
  miner         boolean         default false,
  contract      boolean         default false,
  erc20         boolean         default false,
  usan          text            default null,
  create_at     int             default null,
  active_at     int             default null,
  txs           int             default 0,
  info          json            default null,
  -- how many active swaps this address still has
  swaps         int             default 0,
  -- how many types of tokens an address hold for a specified platform/type
  erc20_tokens  int             default 0,
  fusion_tokens int             default 0,
  tl_tokens     int             default 0
);
insert into address(hash, label, create_at, active_at) values (
  '0xffffffffffffffffffffffffffffffffffffffff', 'FSN CONTRACT', 1561852800, 1561852800
);

create index  idx_address_hash
on address using hash(hash);
create index idx_address_usan
on address using hash(hash);


drop table if exists address_tokens;
create table address_tokens(
  token                 char(66),
  address               char(42),
  qty                   numeric      default 0,
  qty_in                numeric      default 0,
  qty_own               numeric      default 0,
  constraint address_tokens_pkey primary key(address, token)
);
create index idx_token_holder on address_tokens(address);

drop table if exists address_erc20_tokens;
create table address_erc20_tokens(
  token   char(42)  not null,
  address char(42)  not null,
  qty     numeric   not null,
  constraint address_erc20_tokens_pkey primary key(address, token)
);

drop table if exists tx_token;
drop table if exists txs cascade;
create table txs (
  id         bigserial   primary key,
  hash       char(66)    unique not null,
  -- 1: success, 0: failed
  status     int         not null,
  block      bigint      not null,
  fee        text        not null,
  type       int         not null,
  sender     char(42)    not null,
  receiver   char(42)    not null,
  tokens     jsonb       default null,
  data       json        default null,
  age        int         not null
);
create index idx_sender_id on txs (sender, id desc);
create index idx_receiver_id on txs (receiver, id desc);
create index idx_tx_block on txs(block desc);

drop table if exists tx_token;
create table tx_token (
  token varchar(66) not null, 
  tx bigint  not null,
  -- to query token's transactions
  foreign key (tx) references txs(id),
  foreign key (token) references tokens(hash)
);
create index idx_tx_token on tx_token(token, id desc);

drop table if exists anyswap;
create table anyswap(
  id         bigserial   primary key,
  hash       char(66)    unique not null,
  -- 1: success, 0: failed
  status     int         not null,
  block      bigint      not null,
  fee        text        not null,
  type       int         not null,
  sender     char(42)    not null,
  receiver   char(42)    not null,
  tokens     jsonb       default null,
  data       json        default null,
  age        int         not null
);

drop table if exists txs_stats;
create table txs_stats (
  id        serial primary key,
  stats_at  int    unique not null,
  stats     json  not null 
);


drop table if exists swaps;
create table swaps(
  id               serial     primary key,
  hash             char(66)   unique  not null,
  owner            char(44)   not null,
  create_at        int        not null,
  deleted_at       int        default null,
  from_tokens      jsonb      not null,
  to_tokens        jsonb      not null,
  data             json       not null
);;