# Two types of tokens on fusion platform

- ERC20 Statndard tokens

```sql
drop table if exists erc20;
create table erc20 (
  id            serial      primary key,
  hash          char(42)    unique not null,
  issuer        char(42)    default null,
  create_at     int         default null,
  active_at     int         default null,
  issue_tx      text        default null,
  name          text        not null,
  symbol        text        not null,
  -- erc20 token can have a fixed or a variable supply
  qty           text        not null,
  precision     int         not null,
  verified      boolean     default false,
  holders       int         default 0,
  txs           int         default 0,
  -- for future usage
  info          json        default null
);
```

- Fusion native tokens

```sql
drop table if exists tokens;
create table tokens(
  id          serial      primary key,
  hash        char(66)    unique not null,
  name        text        not null,
  symbol      text        not null,
  qty         text        not null,
  precision   numeric     not null,
  issuer      char(42)    not null,
  create_at   int         not null,
  active_at   int         default null,
  issue_tx    char(66)    not null,
  canchange   boolean     default false,
  verified    boolean     default false,
  holders     int         default 0,
  txs         int         default 0,
  info        json        default null
);

-- FSN Token
insert into tokens(hash, name, symbol, qty, precision, issuer, create_at, issue_tx, canchange, verified)
values('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'FUSION', 'FSN', 81920000, 18, '0x0000000000000000000000000000000000000000', 1561894626,'0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', false, true );


```
