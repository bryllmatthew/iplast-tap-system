do $$
begin
  if not exists (select 1 from pg_type where typname = 'campaign_status') then
    create type public.campaign_status as enum ('draft', 'recruiting', 'active', 'completed', 'archived', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'campaign_application_status') then
    create type public.campaign_application_status as enum ('applied', 'under_review', 'approved', 'rejected', 'waitlisted', 'withdrawn');
  end if;
end $$;

create table if not exists public.affiliate_campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  campaign_name text not null,
  campaign_slug text not null unique,
  brand_id uuid not null references public.brands(id) on delete restrict,
  open_plan_commission numeric(8,2) not null default 0,
  campaign_mechanics text not null default '',
  campaign_requirements text not null default '',
  campaign_assets_url text,
  sample_video_links text[] not null default '{}',
  campaign_product_link text,
  status public.campaign_status not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_applications (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.affiliate_campaigns(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  status public.campaign_application_status not null default 'applied',
  application_message text not null default '',
  applied_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, creator_id)
);

alter table public.affiliate_campaigns enable row level security;
alter table public.campaign_applications enable row level security;

drop policy if exists "admin manage affiliate campaigns" on public.affiliate_campaigns;
create policy "admin manage affiliate campaigns" on public.affiliate_campaigns
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

drop policy if exists "creator read recruiting campaigns" on public.affiliate_campaigns;
create policy "creator read recruiting campaigns" on public.affiliate_campaigns
  for select using (
    status in ('recruiting', 'active')
    and exists (
      select 1 from public.creator_accounts
      where user_id = auth.uid() and status = 'active'
    )
  );

drop policy if exists "admin manage campaign applications" on public.campaign_applications;
create policy "admin manage campaign applications" on public.campaign_applications
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

drop policy if exists "creator manage own campaign applications" on public.campaign_applications;
create policy "creator manage own campaign applications" on public.campaign_applications
  for all using (
    exists (
      select 1 from public.creator_accounts ca
      where ca.user_id = auth.uid()
        and ca.creator_id = campaign_applications.creator_id
        and ca.status = 'active'
    )
  )
  with check (
    exists (
      select 1 from public.creator_accounts ca
      where ca.user_id = auth.uid()
        and ca.creator_id = campaign_applications.creator_id
        and ca.status = 'active'
    )
  );
