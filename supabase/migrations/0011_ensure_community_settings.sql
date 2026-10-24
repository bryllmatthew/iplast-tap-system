create table if not exists public.creator_community_settings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  community_name text not null default 'VisMin Creators Club',
  headline text not null default 'Join the VisMin Creators Club community',
  description text not null default '',
  viber_community_link text,
  viber_qr_image_url text,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creator_community_settings enable row level security;

drop policy if exists "admin manage community settings" on public.creator_community_settings;
create policy "admin manage community settings" on public.creator_community_settings for all using (
  public.is_super_admin() or exists (
    select 1 from public.organization_users
    where user_id = auth.uid() and role in ('event_admin', 'event_staff')
  )
) with check (
  public.is_super_admin() or exists (
    select 1 from public.organization_users
    where user_id = auth.uid() and role in ('event_admin', 'event_staff')
  )
);

drop policy if exists "public read community settings" on public.creator_community_settings;
create policy "public read community settings" on public.creator_community_settings for select using (true);

insert into public.creator_community_settings (organization_id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (organization_id) do nothing;
