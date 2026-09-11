# TAP Matchmaking Event System — Codex Build Specification

## 1. Project Overview

Build a web-based **TAP (TikTok Affiliate Partner) Creator–Seller Matchmaking & Sample Redemption System**.

The system is designed for TAP matchmaking events where sellers/brands meet TikTok creators. It must manage:

1. Event creation
2. Dynamic creator registration forms
3. Registration responses
4. Creator approval
5. Onsite creator check-in
6. Unique creator QR allocation per event
7. Seller QR scanning using a phone browser
8. Brand/product selection
9. Sample redemption logging
10. Duplicate sample-claim prevention
11. Event, creator, seller, brand and sample analytics
12. Role-based access

The system should be mobile-first because onsite TAP staff and sellers will primarily use phones/tablets.

---

# 2. Recommended Technology

Use a modern full-stack web architecture.

Preferred stack:

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
  - PostgreSQL
  - Supabase Auth
  - Row Level Security
  - Supabase Storage
- Browser-based QR scanner
- QR generation library
- Server-side validation for all critical business rules

Do not require a native mobile app for the MVP.

Sellers and TAP staff should be able to use the system through a mobile browser.

---

# 3. Core Architecture

The EVENT is the central object.

EVENT
  ├── Registration Form
  │     └── Registration Responses
  │             └── Creator
  │
  ├── Creator Attendance
  │     └── Unique Event QR
  │
  ├── Event Sellers
  │     └── Brands
  │           └── Products
  │
  └── Sample Claims
        ├── Creator
        ├── Seller
        ├── Brand
        └── Product

A creator is a MASTER CREATOR record and may participate in multiple events.

Do not create a completely separate creator record for every event.

---

# 4. User Roles

Implement role-based access.

## Super Admin

Full system access.

Can:
- Manage users
- Manage TAP organizations
- Create/edit/delete events
- Manage registration forms
- Manage creators
- Manage sellers
- Manage brands
- Manage products
- Manage event staff
- View all reports
- View all sample claims
- Configure system settings

## Event Admin

Can:
- Create/manage assigned events
- Create/edit registration forms
- Publish registration forms
- View registration responses
- Approve/reject creators
- Check in creators
- Allocate/view creator QR codes
- Manage participating sellers
- View event analytics

## Event Staff

Can:
- Search creators
- Verify registration
- Check in creators
- View checked-in creator information
- Access onsite event tools

Cannot:
- Modify core system settings
- Manage users
- Delete event data

## Seller Admin

Can:
- Access assigned events
- Manage their brands
- Manage products
- View sample claims
- Scan creator QR codes
- Issue samples
- View seller analytics

## Seller Staff

Can:
- Scan creator QR
- View verified creator information
- Select products
- Issue samples
- View their own sample claim activity

---

# 5. Event Management

Create an Event Management module.

Each event must contain:

- id
- event_name
- event_slug
- description
- venue
- address
- event_date
- start_time
- end_time
- registration_start
- registration_end
- maximum_creator_capacity
- poster_url
- status
- created_by
- created_at
- updated_at

Event status:

- draft
- published
- registration_closed
- ongoing
- completed
- cancelled

Admin actions:

- Create event
- Edit event
- Publish event
- Close registration
- Start event
- Complete event
- Cancel event
- Upload/change event poster

Every event should have a unique public slug.

Example:

/events/davao-seller-matchmaking-sept-2026

---

# 6. Event Poster

The TAP creative team should be able to upload an approved event poster.

Store the poster in Supabase Storage.

The Event Admin can select the approved poster for the event.

Poster should be available for:
- Admin preview
- Social media posting
- Registration page
- Event sharing

The system should not automatically post to social media in the MVP.

---

# 7. Dynamic Registration Form Builder

Each event must have its own registration form.

The form builder should allow the Event Admin to:

- Create form
- Add fields
- Edit fields
- Delete fields
- Reorder fields
- Mark fields required/optional
- Publish/unpublish form
- Edit a published form

Recommended field types:

- Short text
- Long text
- Email
- Phone
- Number
- URL
- Single select
- Multi select
- Checkbox
- Date
- Image/file upload where appropriate

Default creator fields:

- Full Name
- TikTok Username
- TikTok Profile URL
- Mobile Number
- Email
- Location
- Follower Count
- GMV Max Total
- Creator Category/Niche
- Content Categories
- Previous Affiliate Experience

Event-specific fields must be configurable.

Example custom question:

"What product categories are you interested in?"

Options:
- Beauty
- Fashion
- Food
- Electronics
- Home
- Health
- Lifestyle

---

# 8. Registration Form Public Link

Every published registration form gets a public URL.

Example:

/events/davao-matchmaking/register

The registration page must:

- Display event poster
- Display event name
- Display event details
- Display registration form
- Validate required fields
- Prevent invalid submissions
- Show confirmation after successful registration

The public form must not require the creator to have a TAP account for MVP.

After submission, create a registration record.

---

# 9. Form Editing After Publishing

The Event Admin must be able to edit a form even after it has been published.

However, do not destroy existing responses.

Implement form versioning or field snapshots.

Every registration response should retain the field/question structure used when the creator submitted the form.

This prevents historical registrations from breaking when an admin changes a question later.

---

# 10. Registration Results Table

Every event must have its own registration results table.

Example columns:

- Creator
- TikTok Username
- GMV Max Total
- Followers
- Category
- Registration Date
- Registration Status
- Attendance Status

Registration statuses:

- pending
- approved
- rejected
- waitlisted
- cancelled

Admin functions:

- Search
- Filter
- Sort
- View full registration
- Edit creator information
- Approve
- Reject
- Waitlist
- Export CSV

Search should support:

- Creator name
- TikTok username
- Mobile number
- Email

---

# 11. Creator Master Profile

Create a master Creator entity.

Fields:

- id
- full_name
- tiktok_username
- tiktok_profile_url
- email
- mobile
- location
- follower_count
- gmv_max_total
- creator_category
- content_categories
- affiliate_experience
- profile_image
- notes
- created_at
- updated_at

A creator can participate in many events.

Example:

Creator:
Juan Dela Cruz

Event participation:
- Davao Matchmaking — checked in
- Manila Matchmaking — registered
- Cebu Matchmaking — checked in

---

# 12. Event Registration

Create an Event Registration entity connecting creators to events.

Fields:

- id
- event_id
- creator_id
- form_response_id
- registration_status
- registered_at
- approved_at
- approved_by
- notes

Important:

Registered, approved and checked-in are separate states.

---

# 13. Onsite Check-In

Create a dedicated mobile-first Check-In interface.

Example route:

/events/{event}/check-in

Staff can search by:

- Creator name
- TikTok username
- Mobile number

Search results should show:

Creator name
TikTok username
GMV Max Total
Follower count
Registration status
Attendance status

If approved and not checked in:

Show:

CHECK IN CREATOR

When clicked:

- Create attendance record
- Set attendance status to checked_in
- Record timestamp
- Record staff user
- Enable QR allocation

If already checked in:

Display:

ALREADY CHECKED IN

And show:
- Check-in time
- Staff who checked them in
- QR status

---

# 14. Attendance

Create Event Attendance entity.

Fields:

- id
- event_id
- creator_id
- registration_id
- status
- checked_in_at
- checked_in_by
- checked_out_at
- checked_out_by

Statuses:

- not_checked_in
- checked_in
- checked_out

MVP may only require checked_in.

---

# 15. Creator QR Allocation

After successful check-in, generate a unique QR code for that creator's participation in that event.

Important:

The QR should NOT contain sensitive creator information directly.

Use a secure unique token.

Example:

TAP-EVT-2026-000182

or a secure random signed token.

QR should resolve to a secure creator/event record.

Create:

Creator Event QR

Fields:

- id
- event_id
- creator_id
- attendance_id
- qr_token
- qr_url
- status
- generated_at
- last_scanned_at

The QR must be unique per creator per event.

A creator attending another event gets another event-specific QR.

---

# 16. Creator QR Screen

After check-in, show the creator their QR.

Mobile screen should display:

EVENT NAME

Creator Name
@tiktokusername

GMV Max Total
Followers
Category

QR CODE

Status:
CHECKED IN

The QR can be displayed on the creator's phone.

TAP staff should also be able to display/print the QR if necessary.

---

# 17. Seller Portal

Create a mobile-first Seller Portal.

Example:

/seller

Seller logs in.

Dashboard should show:

- Assigned events
- Brands
- Products
- Sample claims
- Scan Creator

Primary action:

SCAN CREATOR QR

---

# 18. QR Scanner

The seller must be able to use their phone camera through the browser.

No native app required.

Flow:

Seller opens scanner
→ Camera opens
→ Seller scans creator QR
→ System validates token
→ System retrieves creator/event information

Before allowing sample redemption, validate:

1. QR is valid
2. QR belongs to the current event
3. Creator is checked in
4. Creator is eligible
5. Seller is assigned to the event

If valid:

Show creator profile.

---

# 19. Creator Verification Screen

After scan:

CREATOR VERIFIED

Juan Dela Cruz

@juandc

GMV Max
₱850,000

Followers
125,000

Category
Beauty / Lifestyle

Event
TAP Seller Matchmaking

Status:
ELIGIBLE FOR SAMPLE CLAIM

Then display:

SELECT BRAND

SELECT PRODUCT

QUANTITY

ISSUE SAMPLE

---

# 20. Seller / Brand Structure

Create:

Seller
Brand
Product

A seller can have multiple brands.

A brand can have multiple products.

Example:

Seller:
ABC Trading

Brand:
ABC Beauty

Products:
- Vitamin C Serum
- Sunscreen
- Collagen Drink

Entities:

Seller:
- id
- company_name
- contact_name
- email
- phone
- logo_url
- status

Brand:
- id
- seller_id
- brand_name
- logo_url
- description
- status

Product:
- id
- brand_id
- product_name
- sku
- image_url
- description
- sample_inventory
- max_claims_per_creator
- status

---

# 21. Event Sellers

A seller must be explicitly assigned to an event.

Create Event Seller entity:

- id
- event_id
- seller_id
- booth_name
- booth_number
- status

This ensures sellers can only operate in events they are assigned to.

---

# 22. Event Products

Products should also be assigned/available to an event.

Create Event Product entity:

- id
- event_id
- product_id
- available_quantity
- max_claims_per_creator
- status

This allows different sample rules for different events.

Example:

Vitamin C Serum

Event A:
- 100 samples
- 1 per creator

Event B:
- 300 samples
- 2 per creator

---

# 23. Sample Claim System

When a seller gives a creator a product sample, create a Sample Claim record.

Fields:

- id
- event_id
- creator_id
- seller_id
- brand_id
- product_id
- quantity
- claimed_at
- claimed_by
- booth_id
- qr_scan_id
- status

Status:

- claimed
- cancelled
- reversed

Do not delete historical claims.

Use cancellation/reversal if a correction is required.

---

# 24. Duplicate Sample Prevention

This is a critical business rule.

Default rule:

ONE CREATOR + ONE EVENT + ONE PRODUCT = ONE SUCCESSFUL CLAIM

The system must check before creating a claim.

If the creator already claimed the product:

Show:

ALREADY CLAIMED

Product:
Vitamin C Serum

Claimed:
September 10, 2026 — 2:14 PM

Seller:
ABC Beauty

Booth:
Booth 12

Do not allow the seller to create another successful claim.

IMPORTANT:

Enforce this at the database level, not only through frontend logic.

Use a database unique constraint/index or equivalent transaction-safe mechanism.

This prevents duplicate claims caused by:
- Double scanning
- Multiple seller devices
- Network race conditions
- Malicious requests
- Frontend bypass

---

# 25. Sample Quantity

MVP default:

One creator can claim one unit of a product.

However, support quantity because future events may have different rules.

Validation:

requested_quantity <= remaining_inventory

and

requested_quantity <= creator_product_claim_limit

The database transaction must atomically check inventory and create the claim.

---

# 26. Sample Claim History

Creator profile should show:

Sample Claim History

| Event | Brand | Product | Quantity | Date |
|---|---|---|---:|---|
| Davao Matchmaking | ABC Beauty | Vitamin C Serum | 1 | Sept 10 |
| Davao Matchmaking | XYZ | Collagen | 1 | Sept 10 |

Seller profile should show:

- Total creators served
- Total samples issued
- Samples by product
- Samples by event

---

# 27. Seller Dashboard

Show:

Today's Event

Creators scanned:
87

Unique creators:
72

Samples issued:
143

Products remaining:
257

Brands:
4

Top product:
Vitamin C Serum — 58 claims

Recent activity:

2:14 PM — @juandc — Vitamin C
2:16 PM — @mariashop — Sunscreen
2:18 PM — @carlo.ph — Vitamin C — Already Claimed

---

# 28. TAP Admin Event Dashboard

Show:

Event Overview

Registered Creators
Approved Creators
Checked-In Creators
Attendance Rate

Seller Metrics

Participating Sellers
Active Sellers
Total Brands
Total Products

Sample Metrics

Total Samples Issued
Unique Creators Served
Total Product Claims
Remaining Samples

---

# 29. Creator Analytics

Track:

- Total events attended
- Total events registered
- Total brands visited
- Total samples claimed
- Product categories claimed
- GMV Max Total
- Followers
- Event participation history

Future AI matching can use this data.

---

# 30. Seller Analytics

Track:

- Events participated
- Creators scanned
- Unique creators
- Total samples issued
- Samples by product
- Samples by creator category
- Sample inventory remaining

---

# 31. Future AI Matchmaking

Do not make AI matchmaking a dependency for the MVP.

Design the database so it can be added later.

Future system:

Creator:
- GMV Max
- Followers
- Category
- Audience
- Content category
- Historical sample claims
- Historical seller interactions
- Performance

Seller:
- Brand
- Products
- Category
- Target audience
- Product requirements

Generate:

MATCH SCORE

Example:

ABC Beauty ↔ @juandc

Match Score: 94%

Reasons:
- Strong beauty category match
- Strong audience overlap
- High GMV Max performance
- Strong previous beauty content performance

Future entities:

match_scores
creator_preferences
seller_preferences
matchmaking_recommendations

---

# 32. Database Tables

Recommended initial database structure:

users
organizations
creators
events
event_forms
event_form_versions
event_form_fields
event_form_responses
event_registrations
event_attendance
creator_event_qr
sellers
seller_users
brands
products
event_sellers
event_products
booths
sample_claims
audit_logs

Optional future tables:

creator_preferences
seller_preferences
match_scores
matchmaking_recommendations

---

# 33. Important Database Relationships

organizations
  ├── users
  ├── events
  ├── sellers
  └── creators

events
  ├── event_forms
  ├── event_registrations
  ├── event_attendance
  ├── creator_event_qr
  ├── event_sellers
  ├── event_products
  └── sample_claims

creators
  ├── event_registrations
  ├── event_attendance
  ├── creator_event_qr
  └── sample_claims

sellers
  ├── seller_users
  ├── brands
  ├── event_sellers
  └── sample_claims

brands
  └── products

products
  ├── event_products
  └── sample_claims

---

# 34. Security Requirements

Use Supabase Row Level Security.

Important rules:

- Sellers can only access assigned events.
- Seller staff can only access their seller's data.
- Event staff can only access assigned events.
- Creators should not access other creators' data.
- Public registration form should only expose fields intended for public registration.
- QR tokens must be unpredictable.
- Never expose sensitive creator data inside the QR payload.
- Validate event association server-side.
- Validate seller event assignment server-side.
- Validate creator attendance server-side.
- Validate sample inventory server-side.
- Enforce duplicate claim rules in the database.
- Record important actions in audit_logs.

---

# 35. Audit Logging

Create audit logs for:

- Event created
- Event edited
- Registration approved
- Registration rejected
- Creator checked in
- QR generated
- QR scanned
- Sample claimed
- Sample claim cancelled/reversed
- Product inventory changed
- Seller added to event
- Product added to event

Fields:

- id
- user_id
- action
- entity_type
- entity_id
- metadata
- created_at

---

# 36. UI Requirements

Use a clean modern SaaS interface.

Admin desktop:
- Sidebar
- Top navigation
- Dashboard cards
- Tables
- Filters
- Search
- Modals/drawers

Mobile seller:
- Very simple interface
- Large scan button
- Camera scanner
- Large creator verification card
- Easy brand/product dropdowns
- Large ISSUE SAMPLE button
- Clear success/error states

The seller workflow must require as few taps as possible.

Ideal flow:

LOGIN
→ SELECT EVENT
→ SCAN QR
→ VERIFY CREATOR
→ SELECT PRODUCT
→ ISSUE SAMPLE
→ SUCCESS

---

# 37. Sample Claim UX

Success:

SAMPLE CLAIMED

Creator:
Juan Dela Cruz

Product:
ABC Beauty Vitamin C Serum

Quantity:
1

Claim Time:
2:14 PM

Seller:
ABC Beauty

Show a clear confirmation.

Duplicate:

SAMPLE ALREADY CLAIMED

Creator has already claimed this product for this event.

Product:
ABC Beauty Vitamin C Serum

Claimed:
2:14 PM

Do not show an ISSUE SAMPLE button.

---

# 38. Registration UX

Public page:

EVENT POSTER

TAP Seller–Creator Matchmaking

September 10, 2026

Davao City

[REGISTER NOW / FORM]

After successful submission:

REGISTRATION RECEIVED

Thank you for registering.

Your registration is currently:

PENDING APPROVAL

The event admin can later approve the registration.

---

# 39. Admin Navigation

Recommended:

Dashboard

Events
  - All Events
  - Create Event
  - Event Registrations
  - Event Check-In
  - Event Sellers
  - Event Products
  - Sample Claims
  - Event Reports

Creators
  - Creator Database

Sellers
  - Sellers
  - Brands
  - Products

Reports

Settings
  - Users
  - Roles
  - Organization

---

# 40. Seller Navigation

Dashboard

My Events

Scan Creator

Sample Claims

Brands

Products

Reports

Account

---

# 41. MVP Priorities

Build in this order.

## Phase 1
Authentication and role system

## Phase 2
Event management

## Phase 3
Dynamic registration form builder

## Phase 4
Registration response management

## Phase 5
Creator master database

## Phase 6
Onsite check-in

## Phase 7
Creator event QR allocation

## Phase 8
Seller portal and QR scanner

## Phase 9
Seller, brand and product management

## Phase 10
Sample claim and duplicate prevention

## Phase 11
Dashboards and reports

## Phase 12
Audit logging and security hardening

## Phase 13
Testing and production deployment

AI matchmaking is a future phase and should not block MVP completion.

---

# 42. Seed/Test Data

Create development seed data.

Example event:

TAP Seller Creator Matchmaking — Davao

Example creators:

Juan Dela Cruz
@mystorecreator
GMV Max: ₱850,000

Maria Santos
@mariashop
GMV Max: ₱420,000

Carlo Reyes
@carlo.ph
GMV Max: ₱1,200,000

Example seller:

ABC Trading

Brand:
ABC Beauty

Products:
- Vitamin C Serum
- Sunscreen
- Collagen Drink

Create sample registrations, check-ins and sample claims for testing.

---

# 43. Critical Acceptance Tests

The system is not complete until these work correctly.

### Event

Admin can create an event.

Admin can publish event.

Published event has a unique registration URL.

### Registration

Creator can submit public registration.

Response appears in event registration table.

Admin can approve creator.

Editing the form after submissions does not corrupt historical responses.

### Check-In

Staff can search creator by name.

Staff can search creator by TikTok username.

Approved creator can be checked in.

Unapproved creator cannot be checked in.

Already checked-in creator cannot create duplicate attendance.

### QR

Checked-in creator receives a unique event QR.

QR is different for different events.

Invalid QR cannot be used.

Creator from another event cannot be redeemed against the wrong event.

### Seller

Seller can log in.

Seller only sees assigned events.

Seller can open phone camera.

Seller can scan creator QR.

System verifies creator.

### Sample

Seller selects brand.

Seller selects product.

Seller issues sample.

Claim is recorded.

Inventory decreases.

Creator's claim history updates.

### Duplicate Prevention

Creator cannot claim the same product twice in the same event.

Duplicate prevention must work even if two devices attempt the claim simultaneously.

### Security

Seller cannot access another seller's claims.

Event staff cannot modify unrelated events.

Creator cannot access another creator's private information.

---

# 44. Important Product Decision

The system should distinguish:

REGISTRATION
APPROVAL
ATTENDANCE
QR
SAMPLE CLAIM

These are separate records/states.

Do not simplify them into one status field.

This separation is essential for reliable event operations and reporting.

---

# 45. Build Philosophy

Build the MVP as a production-ready foundation rather than a prototype.

Prioritize:

- Reliable database relationships
- Mobile-first seller experience
- Fast onsite check-in
- Secure QR validation
- Transaction-safe sample redemption
- Strong duplicate prevention
- Clear audit trail
- Extensible architecture for future AI matchmaking

Do not overbuild AI features before the event and sample redemption workflow is stable.

The primary MVP success criterion is:

A creator registers → TAP verifies/checks them in → creator receives event QR → seller scans QR → seller sees verified creator → seller selects brand/product → system checks eligibility → sample is issued → duplicate claims are prevented → TAP can report the entire event.
