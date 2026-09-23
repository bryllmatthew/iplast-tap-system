create table if not exists public.creator_accounts (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  status text not null default 'active' check (status in ('pending', 'active', 'suspended')),
  invited_by uuid references public.profiles(id),
  invited_at timestamptz not null default now(),
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_id),
  unique (user_id)
);

create unique index if not exists creator_accounts_email_unique
  on public.creator_accounts (lower(email));

alter table public.creator_accounts enable row level security;

drop policy if exists "admin manage creator accounts" on public.creator_accounts;
create policy "admin manage creator accounts" on public.creator_accounts
  for all using (
    public.is_super_admin()
    or exists (
      select 1 from public.organization_users
      where user_id = auth.uid() and role in ('event_admin', 'event_staff')
    )
  )
  with check (
    public.is_super_admin()
    or exists (
      select 1 from public.organization_users
      where user_id = auth.uid() and role in ('event_admin', 'event_staff')
    )
  );

drop policy if exists "creator read own account" on public.creator_accounts;
create policy "creator read own account" on public.creator_accounts
  for select using (user_id = auth.uid() and status = 'active');
