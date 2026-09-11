create extension if not exists pgcrypto;

create type public.app_role as enum ('super_admin', 'event_admin', 'event_staff', 'seller_admin', 'seller_staff');
create type public.event_status as enum ('draft', 'published', 'registration_closed', 'ongoing', 'completed', 'cancelled');
create type public.registration_status as enum ('pending', 'approved', 'rejected', 'waitlisted', 'cancelled');
create type public.attendance_status as enum ('not_checked_in', 'checked_in', 'checked_out');
create type public.form_status as enum ('draft', 'published', 'archived');
create type public.field_type as enum ('short_text', 'long_text', 'email', 'phone', 'number', 'url', 'single_select', 'multi_select', 'checkbox', 'date', 'file');
create type public.record_status as enum ('active', 'inactive');
create type public.qr_status as enum ('pending_approval', 'approved_not_checked_in', 'active', 'revoked');
create type public.claim_status as enum ('claimed', 'cancelled', 'reversed');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, role)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_name text not null,
  event_slug text not null unique,
  description text not null default '',
  venue text not null default '',
  address text not null default '',
  event_date date not null,
  start_time time not null,
  end_time time not null,
  registration_start timestamptz not null,
  registration_end timestamptz not null,
  maximum_creator_capacity integer not null check (maximum_creator_capacity > 0),
  poster_url text,
  status public.event_status not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_staff (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null check (role in ('event_admin', 'event_staff')),
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table public.event_forms (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null default 'Creator Registration',
  active_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id)
);

create table public.event_form_versions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.event_forms(id) on delete cascade,
  version_number integer not null,
  status public.form_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (form_id, version_number)
);

alter table public.event_forms
  add constraint event_forms_active_version_id_fkey
  foreign key (active_version_id) references public.event_form_versions(id);

create table public.event_form_fields (
  id uuid primary key default gen_random_uuid(),
  form_version_id uuid not null references public.event_form_versions(id) on delete cascade,
  label text not null,
  field_key text not null,
  field_type public.field_type not null,
  required boolean not null default false,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  unique (form_version_id, field_key)
);

create table public.creators (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  tiktok_username text not null,
  tiktok_profile_url text,
  email text,
  mobile text,
  location text,
  follower_count integer not null default 0,
  gmv_max_total numeric(14,2) not null default 0,
  creator_category text,
  content_categories text[] not null default '{}',
  affiliate_experience text,
  profile_image text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index creators_org_email_unique on public.creators (organization_id, lower(email)) where email is not null;
create unique index creators_org_mobile_unique on public.creators (organization_id, mobile) where mobile is not null;

create table public.event_form_responses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  form_version_id uuid not null references public.event_form_versions(id),
  field_snapshot jsonb not null,
  answers jsonb not null,
  submitted_at timestamptz not null default now()
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  form_response_id uuid not null references public.event_form_responses(id),
  registration_status public.registration_status not null default 'pending',
  registered_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references public.profiles(id),
  notes text,
  unique (event_id, creator_id)
);

create table public.event_attendance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  status public.attendance_status not null default 'checked_in',
  checked_in_at timestamptz,
  checked_in_by uuid references public.profiles(id),
  checked_out_at timestamptz,
  checked_out_by uuid references public.profiles(id),
  unique (event_id, creator_id),
  unique (registration_id)
);

create table public.creator_event_qr (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  registration_id uuid not null references public.event_registrations(id) on delete cascade,
  attendance_id uuid references public.event_attendance(id) on delete set null,
  qr_token text not null unique default encode(gen_random_bytes(32), 'hex'),
  qr_url text,
  status public.qr_status not null default 'pending_approval',
  generated_at timestamptz not null default now(),
  last_scanned_at timestamptz,
  unique (event_id, creator_id)
);

create table public.sellers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  logo_url text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seller_users (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null check (role in ('seller_admin', 'seller_staff')),
  created_at timestamptz not null default now(),
  unique (seller_id, user_id)
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  brand_name text not null,
  logo_url text,
  description text,
  status public.record_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  product_name text not null,
  sku text,
  image_url text,
  description text,
  sample_inventory integer not null default 0 check (sample_inventory >= 0),
  max_claims_per_creator integer not null default 1 check (max_claims_per_creator > 0),
  status public.record_status not null default 'active',
  created_at timestamptz not null default now()
);

create table public.event_sellers (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  seller_id uuid not null references public.sellers(id) on delete cascade,
  booth_name text,
  booth_number text,
  status public.record_status not null default 'active',
  unique (event_id, seller_id)
);

create table public.booths (
  id uuid primary key default gen_random_uuid(),
  event_seller_id uuid not null references public.event_sellers(id) on delete cascade,
  booth_name text,
  booth_number text,
  created_at timestamptz not null default now()
);

create table public.event_products (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  available_quantity integer not null default 0 check (available_quantity >= 0),
  max_claims_per_creator integer not null default 1 check (max_claims_per_creator > 0),
  status public.record_status not null default 'active',
  unique (event_id, product_id)
);

create table public.qr_scans (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  seller_id uuid references public.sellers(id),
  creator_id uuid references public.creators(id),
  qr_id uuid references public.creator_event_qr(id),
  scanned_by uuid references public.profiles(id),
  result text not null,
  created_at timestamptz not null default now()
);

create table public.sample_claims (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  creator_id uuid not null references public.creators(id) on delete cascade,
  seller_id uuid not null references public.sellers(id) on delete restrict,
  brand_id uuid not null references public.brands(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  claimed_at timestamptz not null default now(),
  claimed_by uuid references public.profiles(id),
  booth_id uuid references public.booths(id),
  qr_scan_id uuid references public.qr_scans(id),
  status public.claim_status not null default 'claimed'
);

create unique index sample_claims_one_successful_claim
  on public.sample_claims (event_id, creator_id, product_id)
  where status = 'claimed';

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from organization_users
    where user_id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function public.user_can_access_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (select 1 from event_staff where event_id = target_event_id and user_id = auth.uid())
    or exists (
      select 1
      from event_sellers es
      join seller_users su on su.seller_id = es.seller_id
      where es.event_id = target_event_id and su.user_id = auth.uid()
    );
$$;

create or replace function public.current_user_seller_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select seller_id from seller_users where user_id = auth.uid() limit 1;
$$;

create or replace function public.issue_sample_claim(
  p_event_id uuid,
  p_qr_token text,
  p_product_id uuid,
  p_quantity integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_seller_id uuid;
  v_brand_id uuid;
  v_creator_id uuid;
  v_qr_id uuid;
  v_scan_id uuid;
  v_claim_id uuid;
  v_existing sample_claims%rowtype;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  select public.current_user_seller_id() into v_seller_id;
  if v_seller_id is null then
    raise exception 'seller_not_found';
  end if;

  if not exists (
    select 1 from event_sellers
    where event_id = p_event_id and seller_id = v_seller_id and status = 'active'
  ) then
    raise exception 'seller_not_assigned_to_event';
  end if;

  select q.id, q.creator_id
    into v_qr_id, v_creator_id
  from creator_event_qr q
  join event_registrations r on r.id = q.registration_id
  join event_attendance a on a.id = q.attendance_id
  where q.qr_token = p_qr_token
    and q.event_id = p_event_id
    and q.status = 'active'
    and r.registration_status = 'approved'
    and a.status = 'checked_in'
  for update;

  if v_qr_id is null then
    insert into qr_scans(event_id, seller_id, scanned_by, result)
    values (p_event_id, v_seller_id, v_user, 'invalid_qr');
    raise exception 'invalid_qr';
  end if;

  select b.id
    into v_brand_id
  from products p
  join brands b on b.id = p.brand_id
  where p.id = p_product_id and b.seller_id = v_seller_id and p.status = 'active' and b.status = 'active';

  if v_brand_id is null then
    raise exception 'product_not_available_for_seller';
  end if;

  select *
    into v_existing
  from sample_claims
  where event_id = p_event_id
    and creator_id = v_creator_id
    and product_id = p_product_id
    and status = 'claimed';

  if v_existing.id is not null then
    return jsonb_build_object('ok', false, 'code', 'already_claimed', 'claim_id', v_existing.id);
  end if;

  update event_products
    set available_quantity = available_quantity - p_quantity
  where event_id = p_event_id
    and product_id = p_product_id
    and status = 'active'
    and available_quantity >= p_quantity
    and max_claims_per_creator >= p_quantity;

  if not found then
    raise exception 'inventory_or_limit_failed';
  end if;

  insert into qr_scans(event_id, seller_id, creator_id, qr_id, scanned_by, result)
  values (p_event_id, v_seller_id, v_creator_id, v_qr_id, v_user, 'valid')
  returning id into v_scan_id;

  insert into sample_claims(event_id, creator_id, seller_id, brand_id, product_id, quantity, claimed_by, qr_scan_id, status)
  values (p_event_id, v_creator_id, v_seller_id, v_brand_id, p_product_id, p_quantity, v_user, v_scan_id, 'claimed')
  returning id into v_claim_id;

  update creator_event_qr set last_scanned_at = now() where id = v_qr_id;

  insert into audit_logs(user_id, action, entity_type, entity_id, metadata)
  values (v_user, 'sample_claimed', 'sample_claim', v_claim_id, jsonb_build_object('event_id', p_event_id, 'product_id', p_product_id));

  return jsonb_build_object('ok', true, 'code', 'claimed', 'claim_id', v_claim_id);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'code', 'already_claimed');
end;
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_users enable row level security;
alter table public.events enable row level security;
alter table public.event_staff enable row level security;
alter table public.event_forms enable row level security;
alter table public.event_form_versions enable row level security;
alter table public.event_form_fields enable row level security;
alter table public.creators enable row level security;
alter table public.event_form_responses enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_attendance enable row level security;
alter table public.creator_event_qr enable row level security;
alter table public.sellers enable row level security;
alter table public.seller_users enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.event_sellers enable row level security;
alter table public.booths enable row level security;
alter table public.event_products enable row level security;
alter table public.qr_scans enable row level security;
alter table public.sample_claims enable row level security;
alter table public.audit_logs enable row level security;

create policy "public can read published events" on public.events for select using (status in ('published', 'registration_closed', 'ongoing'));
create policy "event users can read events" on public.events for select using (public.user_can_access_event(id));
create policy "super admins manage events" on public.events for all using (public.is_super_admin()) with check (public.is_super_admin());

create policy "public read active event forms" on public.event_forms for select using (
  exists (select 1 from events e where e.id = event_id and e.status in ('published', 'ongoing'))
);
create policy "public read published form versions" on public.event_form_versions for select using (status = 'published');
create policy "public read published form fields" on public.event_form_fields for select using (
  exists (select 1 from event_form_versions v where v.id = form_version_id and v.status = 'published')
);

create policy "event access creators" on public.creators for select using (
  public.is_super_admin()
  or exists (
    select 1 from event_registrations r
    where r.creator_id = creators.id and public.user_can_access_event(r.event_id)
  )
);

create policy "event access registrations" on public.event_registrations for select using (public.user_can_access_event(event_id));
create policy "event staff manage registrations" on public.event_registrations for update using (public.user_can_access_event(event_id));
create policy "event access attendance" on public.event_attendance for select using (public.user_can_access_event(event_id));
create policy "event staff manage attendance" on public.event_attendance for insert with check (public.user_can_access_event(event_id));
create policy "event access qr" on public.creator_event_qr for select using (public.user_can_access_event(event_id));

create policy "seller users read own seller" on public.sellers for select using (
  public.is_super_admin() or exists (select 1 from seller_users su where su.seller_id = sellers.id and su.user_id = auth.uid())
);
create policy "seller users read brands" on public.brands for select using (
  public.is_super_admin() or exists (select 1 from seller_users su where su.seller_id = brands.seller_id and su.user_id = auth.uid())
);
create policy "seller users read products" on public.products for select using (
  public.is_super_admin()
  or exists (
    select 1 from brands b
    join seller_users su on su.seller_id = b.seller_id
    where b.id = products.brand_id and su.user_id = auth.uid()
  )
);
create policy "event users read event sellers" on public.event_sellers for select using (public.user_can_access_event(event_id));
create policy "event users read event products" on public.event_products for select using (public.user_can_access_event(event_id));
create policy "seller/event users read claims" on public.sample_claims for select using (
  public.user_can_access_event(event_id)
  or seller_id = public.current_user_seller_id()
);
create policy "event users read audit logs" on public.audit_logs for select using (public.is_super_admin());
