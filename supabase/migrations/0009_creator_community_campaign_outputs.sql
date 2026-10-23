do $$
begin
  if not exists (select 1 from pg_type where typname = 'campaign_output_status') then
    create type public.campaign_output_status as enum ('not_submitted', 'pending_review', 'changes_requested', 'approved');
  end if;
end $$;

create table if not exists public.campaign_outputs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.campaign_applications(id) on delete cascade,
  final_output_link text,
  submission_notes text not null default '',
  status public.campaign_output_status not null default 'not_submitted',
  review_notes text not null default '',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_postings (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null unique references public.campaign_applications(id) on delete cascade,
  posted_video_link text not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

alter table public.creators add column if not exists community_joined_at timestamptz;
alter table public.creators add column if not exists community_joined_via text;

alter table public.campaign_outputs enable row level security;
alter table public.campaign_postings enable row level security;
alter table public.creator_community_settings enable row level security;

drop policy if exists "admin manage campaign outputs" on public.campaign_outputs;
create policy "admin manage campaign outputs" on public.campaign_outputs for all using (
  public.is_super_admin() or exists (select 1 from public.organization_users where user_id = auth.uid() and role in ('event_admin', 'event_staff'))
) with check (
  public.is_super_admin() or exists (select 1 from public.organization_users where user_id = auth.uid() and role in ('event_admin', 'event_staff'))
);

drop policy if exists "creator manage own campaign outputs" on public.campaign_outputs;
create policy "creator manage own campaign outputs" on public.campaign_outputs for all using (
  exists (
    select 1 from public.campaign_applications ca
    join public.creator_accounts account on account.creator_id = ca.creator_id
    where ca.id = campaign_outputs.application_id and account.user_id = auth.uid() and account.status = 'active' and ca.status = 'approved'
  )
) with check (
  exists (
    select 1 from public.campaign_applications ca
    join public.creator_accounts account on account.creator_id = ca.creator_id
    where ca.id = campaign_outputs.application_id and account.user_id = auth.uid() and account.status = 'active' and ca.status = 'approved'
  )
);

drop policy if exists "admin manage campaign postings" on public.campaign_postings;
create policy "admin manage campaign postings" on public.campaign_postings for all using (
  public.is_super_admin() or exists (select 1 from public.organization_users where user_id = auth.uid() and role in ('event_admin', 'event_staff'))
) with check (
  public.is_super_admin() or exists (select 1 from public.organization_users where user_id = auth.uid() and role in ('event_admin', 'event_staff'))
);

drop policy if exists "creator manage own campaign postings" on public.campaign_postings;
create policy "creator manage own campaign postings" on public.campaign_postings for all using (
  exists (
    select 1 from public.campaign_applications ca
    join public.creator_accounts account on account.creator_id = ca.creator_id
    where ca.id = campaign_postings.application_id and account.user_id = auth.uid() and account.status = 'active' and ca.status = 'approved'
  )
) with check (
  exists (
    select 1 from public.campaign_applications ca
    join public.creator_accounts account on account.creator_id = ca.creator_id
    where ca.id = campaign_postings.application_id and account.user_id = auth.uid() and account.status = 'active' and ca.status = 'approved'
  )
);

drop policy if exists "admin manage community settings" on public.creator_community_settings;
create policy "admin manage community settings" on public.creator_community_settings for all using (
  public.is_super_admin() or exists (select 1 from public.organization_users where user_id = auth.uid() and role in ('event_admin', 'event_staff'))
) with check (
  public.is_super_admin() or exists (select 1 from public.organization_users where user_id = auth.uid() and role in ('event_admin', 'event_staff'))
);

drop policy if exists "public read community settings" on public.creator_community_settings;
create policy "public read community settings" on public.creator_community_settings for select using (true);

insert into public.creator_community_settings (organization_id)
values ('00000000-0000-0000-0000-000000000001')
on conflict (organization_id) do nothing;
