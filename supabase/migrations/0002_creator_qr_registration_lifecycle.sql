alter type public.qr_status add value if not exists 'pending_approval';
alter type public.qr_status add value if not exists 'approved_not_checked_in';

alter table public.creator_event_qr
  add column if not exists registration_id uuid references public.event_registrations(id) on delete cascade;

update public.creator_event_qr q
set registration_id = r.id
from public.event_registrations r
where q.registration_id is null
  and r.event_id = q.event_id
  and r.creator_id = q.creator_id;

alter table public.creator_event_qr
  alter column attendance_id drop not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'creator_event_qr'
      and column_name = 'registration_id'
      and is_nullable = 'YES'
  ) then
    if not exists (select 1 from public.creator_event_qr where registration_id is null) then
      alter table public.creator_event_qr alter column registration_id set not null;
    end if;
  end if;
end $$;

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
    values (p_event_id, v_seller_id, v_user, 'qr_not_redeemable');
    raise exception 'qr_not_redeemable';
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
