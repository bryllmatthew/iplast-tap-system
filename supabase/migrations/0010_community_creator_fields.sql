alter table public.creators
  add column if not exists shipping_address text not null default '';
