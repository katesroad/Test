-- fusion token holders
drop view if exists fusion_token_holders_view;
create view fusion_token_holders_view
as
  select
    address, address_tokens.qty, qty_in, qty_own
  from address_tokens
  order by qty desc;

-- erc20 token holders
drop view if exists erc20_token_holders_view;
create view erc20_token_holders_view
as
  select
    address, address_erc20_tokens.qty
  from
    address_erc20_tokens
  order by qty desc;


-- address fusion platform issued token balance
drop view if exists address_tokens_view;
create view address_tokens_view
as
  select
    token, address, address_tokens.qty, qty_in, symbol
  from address_tokens
    left join tokens
    on
  address_tokens.token = tokens.hash;

-- address erc20 balance
drop view if exists address_erc20_tokens_view;
create view address_erc20_tokens_view
as
  select
    address_erc20_tokens.qty as qty, address, token , symbol
  from address_erc20_tokens
    left join
    tokens
    on 
  tokens.hash = address_erc20_tokens.token;

-- address overview
drop view if exists address_overview_view;
create view address_overview_view
as
  select
    hash, contract, qty as fsn, qty_in as fsn_in, miner, label, usan, txs, erc20_tokens, fusion_tokens, tl_tokens, erc20, create_at, active_at, swaps
  from
    address
    left join
    (select *
    from address_tokens
    where address_tokens.token='0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
  as fsn_holders
    on address.hash = fsn_holders.address;

----token list
drop view if exists tokens_view;
create view tokens_view
as
  select
    hash, symbol, qty, txs, holders,
    count(id) over() as total
  from tokens;

---- erc20 token list
drop view if exists erc20_tokens_view;
create view erc20_tokens_view
as
  select
    hash, symbol, qty, txs, holders,
    count(id) over() as total
  from tokens
  where token_type=1;
