

create or replace function receiver_txs_desc(tx_receiver char, take integer, anchor integer default null)
RETURNS table(id bigint)
AS $BODY$
BEGIN
  if anchor is null
  then
  return query
  	select txs.id
    from txs
    where txs.receiver = tx_receiver
    order by id desc
    limit take;
  else
  return query
    select txs.id
    from txs
    where txs.receiver = tx_receiver
    and txs.id < anchor
    order by id desc
    limit take;
  end if;
END;$BODY$ LANGUAGE plpgsql;

-- txs received
create or replace function receiver_txs_asc(tx_receiver char, take integer, anchor integer default null)
RETURNS table(id bigint)
AS $BODY$
BEGIN
  if anchor is null
  then
  return query
  	select txs.id
    from txs
    where txs.receiver = tx_receiver
    order by id asc
    limit take;
  else
  return query
    select txs.id
    from txs
    where txs.receiver = tx_receiver
    and txs.id > anchor
    order by id asc
    limit take;
  end if;
END;$BODY$ LANGUAGE plpgsql;;



-- txs made
create or replace function sender_txs_desc(tx_sender char(42), take integer, anchor integer default null)
RETURNS table(id bigint)
AS $BODY$
BEGIN
  if anchor is null
  then
  return query
  	select txs.id
    from txs
    where txs.sender = tx_sender
    order by id desc
    limit take;
  else
  return query
    select txs.id
    from txs
    where txs.sender = tx_sender
    and txs.id < anchor
    order by id desc
    limit take;
  end if;
END;$BODY$ LANGUAGE plpgsql;

create or replace function sender_txs_asc(tx_sender char(42), take integer, anchor integer default null)
RETURNS table(id bigint)
AS $BODY$
BEGIN
  if anchor is null
  then
  return query
  	select txs.id
    from txs
    where txs.sender = tx_sender
    order by id asc
    limit take;
  else
  return query
    select txs.id
    from txs
    where txs.sender = tx_sender
    and txs.id > anchor
    order by id asc
    limit take;
  end if;
END;$BODY$ LANGUAGE plpgsql;;


-- txs made and received
-- txs made and received
create or replace function address_txs_asc(address char, take int, anchor int default null)
returns table(id bigint)
as $$
begin
  return query
  select receiver_txs_asc(address, take, anchor)
  UNION
  select sender_txs_asc(address, take, anchor);
end;$$language plpgsql;

-- txs made and received
create or replace function address_txs_desc(address char, take int, anchor int default null)
returns table(id bigint)
as $$
begin
  return query
  select receiver_txs_desc(address, take, anchor)
  UNION
  select sender_txs_desc(address, take, anchor);
end;$$language plpgsql;

-- token's txs
create or replace function token_txs_asc(token char, take int, anchor int default null)
returns table(id bigint)
as $$
begin
  return query 
  select txs.id 
  from txs
  where tokens @>  to_jsonb(token)
  order by id asc
  limit take;
end; $$ LANGUAGE plpgsql;;

create or replace function token_txs_desc(token char, take int, anchor int default null)
returns table(id bigint)
as $$
begin
  return query 
  select txs.id 
  from txs
  where tokens @>  to_jsonb(token)
  order by id desc
  limit take;
end; $$ LANGUAGE plpgsql;;



create or replace function range_txs_desc( take integer, anchor integer default null)
RETURNS table(id bigint)
AS $BODY$
BEGIN
  if anchor is null
  then
  return query
  	select txs.id
    from txs
    order by id desc
    limit take;
  else
  return query
    select txs.id
    from txs
    where txs.id < anchor
    order by id desc
    limit take;
  end if;
END;$BODY$ LANGUAGE plpgsql;

create or replace function range_txs_asc( take integer, anchor integer default null)
RETURNS table(id bigint)
AS $BODY$
BEGIN
  if anchor is null
  then
  return query
  	select txs.id
    from txs
    order by id asc
    limit take;
  else
  return query
    select txs.id
    from txs
    where txs.id > anchor
    order by id asc
    limit take;
  end if;
END;$BODY$ LANGUAGE plpgsql;


drop function if exists token_txs_asc;
create or replace function token_txs_asc(token_hash varchar(66), take integer, anchor integer default null)
RETURNS table(id bigint)
AS $BODY$
BEGIN
  if anchor is null
  then
  return query
  	select tx_token.tx
    from tx_token
    where tx_token.token = token_hash
    order by tx_token.tx asc
    limit take;
  else
  return query
    select tx_token.tx
    from tx_token
    where tx_token.token = token_hash
    and tx_token.tx > anchor
    order by tx_token.tx asc
    limit take;
  end if;
END;$BODY$ LANGUAGE plpgsql;

select token_txs_asc('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 100, 83);

drop function if exists token_txs_desc;
create or replace function token_txs_desc(token_hash varchar(66), take integer, anchor integer default null)
RETURNS table(id bigint)
AS $BODY$
BEGIN
  if anchor is null
  then
  return query
  	select tx_token.tx
    from tx_token
    where tx_token.token = token_hash
    order by tx_token.tx desc
    limit take;
  else
  return query
    select tx_token.tx
    from tx_token
    where tx_token.token = token_hash
    and tx_token.tx < anchor
    order by tx_token.tx desc
    limit take;
  end if;
END;$BODY$ LANGUAGE plpgsql;

select token_txs_desc('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 100);;