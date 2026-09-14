alter table public.sellers
  add column if not exists shop_code text,
  add column if not exists shop_link text,
  add column if not exists open_plan_commission numeric(8, 2) not null default 0,
  add column if not exists tap_commission numeric(8, 2) not null default 0;

alter table public.products
  add column if not exists pid text,
  add column if not exists product_link text;
