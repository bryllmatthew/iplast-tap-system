create table if not exists public.seller_invites (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  username text,
  email text not null,
  login_url text not null,
  temporary_password text not null,
  status text not null default 'queued' check (status in ('queued', 'sent')),
  created_at timestamptz not null default now()
);

alter table public.seller_invites enable row level security;

drop policy if exists "super admins manage seller invites" on public.seller_invites;
create policy "super admins manage seller invites"
  on public.seller_invites
  for all
  using (public.is_super_admin())
  with check (public.is_super_admin());
