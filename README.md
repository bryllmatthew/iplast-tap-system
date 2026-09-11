# TAP Matchmaking Event System

Production-oriented MVP for TAP creator-seller matchmaking events.

## What is implemented

- Next.js App Router, TypeScript, Tailwind CSS
- Public event and registration pages
- Dynamic registration fields with response snapshots in the domain model
- Creator event QR generated immediately after registration
- QR save, copy-link, and mobile share controls with no paid delivery dependency
- Admin dashboard, registration approval, check-in, seller/product views, reports
- Event-specific creator QR display
- Mobile-first seller portal with camera/manual QR verification
- Sample claim flow with duplicate/inventory checks in the demo repository
- Supabase schema, RLS policies, seed data, and transactional `issue_sample_claim` RPC

The app runs with seeded in-memory demo data by default so the workflow can be tested before Supabase keys are configured.

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful demo paths:

- `/events/davao-seller-matchmaking-sept-2026`
- `/admin`
- `/admin/events/new`
- `/admin/events/evt_davao_2026`
- `/admin/registrations`
- `/admin/events/evt_davao_2026/check-in`
- `/admin/creators`
- `/admin/creators/cre_juan`
- `/events`
- `/qr/tap_demo_juan_2026`
- `/seller/events/evt_davao_2026/scan`
- `/seller/events`
- `/seller/products`
- `/seller/events/evt_davao_2026/claims?product=prd_vitc&creator=juan`

Manual seller scan token:

```text
tap_demo_juan_2026
```

Additional QR lifecycle demo tokens:

```text
tap_demo_maria_2026  # approved, not checked in
tap_demo_carlo_2026  # pending approval
```

Seller redemption only works after a registration is approved and checked in. The QR can still be saved by the creator immediately after registration.

## Supabase setup

1. Create a Supabase project.
2. Apply `supabase/migrations/0001_initial_schema.sql`.
3. Apply `supabase/seed.sql`.
4. Add environment values from `.env.example`.
5. Replace demo repository calls with Supabase-backed queries incrementally, keeping `issue_sample_claim` as the transactional source of truth.

The migration includes the important production constraints:

- Unique event slug
- One registration per event and creator
- One attendance record per event and creator
- One QR per event and creator
- Partial unique index preventing duplicate successful claims per event, creator, and product
- Transactional claim RPC that validates assignment, attendance, inventory, claim limit, and duplicate claims
