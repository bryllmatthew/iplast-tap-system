insert into public.organizations (id, name)
values ('00000000-0000-0000-0000-000000000001', 'TAP Philippines')
on conflict do nothing;

insert into public.events (
  id, organization_id, event_name, event_slug, description, venue, address, event_date,
  start_time, end_time, registration_start, registration_end, maximum_creator_capacity, poster_url, status
) values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'TAP Seller Creator Matchmaking - Davao',
  'davao-seller-matchmaking-sept-2026',
  'A curated seller and TikTok creator matchmaking event for sample redemption and affiliate discovery.',
  'SMX Convention Center Davao',
  'Lanang, Davao City',
  '2026-09-10',
  '10:00',
  '17:00',
  '2026-08-01T00:00:00+08:00',
  '2026-09-09T23:59:59+08:00',
  300,
  'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1400&q=80',
  'ongoing'
) on conflict do nothing;

insert into public.sellers (id, organization_id, company_name, contact_name, username, email, phone, status)
values (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'ABC Trading',
  'Ana Bautista',
  'abc-trading',
  'abc-trading@seller.tap.iplast.ai',
  '+639178880000',
  'active'
) on conflict do nothing;

insert into public.brands (id, seller_id, brand_name, description, status)
values (
  '30000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'ABC Beauty',
  'Beauty and wellness products for creator-led commerce.',
  'active'
) on conflict do nothing;

insert into public.products (id, brand_id, product_name, sku, description, sample_inventory, max_claims_per_creator, status)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Vitamin C Serum', 'ABC-VITC-30', 'Brightening serum sample.', 100, 1, 'active'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Sunscreen', 'ABC-SUN-50', 'Daily SPF sample.', 80, 1, 'active'),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Collagen Drink', 'ABC-COL-12', 'Beauty drink sample pack.', 120, 1, 'active')
on conflict do nothing;

insert into public.event_sellers (id, event_id, seller_id, booth_name, booth_number, status)
values (
  '50000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'ABC Beauty Booth',
  'Booth 12',
  'active'
) on conflict do nothing;

insert into public.event_products (event_id, product_id, available_quantity, max_claims_per_creator, status)
values
  ('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 100, 1, 'active'),
  ('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 80, 1, 'active'),
  ('10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000003', 120, 1, 'active')
on conflict do nothing;
