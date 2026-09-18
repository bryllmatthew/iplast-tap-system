alter table public.sellers
  add column if not exists username text;

update public.sellers
set username = trim(both '-' from lower(regexp_replace(coalesce(nullif(split_part(email, '@', 1), ''), company_name, id::text), '[^a-zA-Z0-9._-]+', '-', 'g')))
where username is null or username = '';

with ranked as (
  select
    id,
    username,
    row_number() over (partition by lower(username) order by created_at, id) as duplicate_rank
  from public.sellers
)
update public.sellers s
set username = ranked.username || '-' || ranked.duplicate_rank
from ranked
where ranked.id = s.id and ranked.duplicate_rank > 1;

alter table public.sellers
  alter column username set not null;

create unique index if not exists sellers_username_unique
  on public.sellers (lower(username));

alter table public.seller_invites
  add column if not exists username text;

update public.seller_invites i
set username = s.username
from public.sellers s
where s.id = i.seller_id and (i.username is null or i.username = '');
