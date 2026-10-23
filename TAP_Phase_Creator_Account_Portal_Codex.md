# TAP Platform — Next Phase: Creator Account & Creator Portal

## Codex Implementation Prompt

### Objective

Extend the existing TAP Matchmaking Event System by adding a dedicated **Creator Account** and **Creator Portal**.

This phase must focus ONLY on the Creator account/use case and the Admin functionality required to support creators.

Do **not** build the AI UGC Creative Director yet. That will be implemented in the next phase after the Creator Portal and its data model are stable.

The Creator Portal must connect to the existing:

- Creator master database
- Events
- Event registrations
- Event attendance
- Creator QR system
- Sellers
- Brands
- Products
- Sample claims
- Admin authentication/authorization

This phase also introduces **Affiliate Campaign Management** because creators need campaigns to discover, apply for, participate in, submit content for, and track earnings from.

---

# 1. Account Types

The platform should now support these primary account types:

1. Admin
2. Seller
3. Creator

Future account type:

4. AI UGC Creative Director / Creative Team

Do not implement the AI Creative Director account in this phase.

Use one authentication infrastructure but provide role-based routing and separate portal experiences.

Suggested routes:

- `/admin/*`
- `/seller/*`
- `/creator/*`

After login, redirect users based on their account type.

A Creator must never be able to access Admin or Seller routes.

---

# 2. Creator Account Relationship

The existing `creators` master table should remain the canonical creator profile.

Do NOT create a second disconnected creator profile when a Creator account is created.

Instead, associate an authenticated user with an existing or newly created Creator record.

Recommended relationship:

```text
users
  id
  account_type = creator
        │
        ▼
creator_accounts
  user_id
  creator_id
        │
        ▼
creators
```

If the existing architecture can safely place `user_id` directly on the creator record, that is acceptable, but preserve a clean one-to-one relationship.

Important:

- One Creator account should map to one Creator master profile.
- Existing creators created through event registrations must be claimable/linkable to a Creator account without duplicating historical data.
- Historical events, QR allocations, sample claims, and registrations must remain associated with the same creator.

---

# 3. Creator Registration / Account Activation

Support two Creator onboarding paths.

## Path A — New Creator Signup

Creator signs up through the Creator Portal.

Collect at minimum:

- Full name
- Email
- Mobile number
- TikTok username
- TikTok profile URL
- Location
- Creator category / niche

Optional profile fields:

- Follower count
- GMV Max total
- Content categories
- Affiliate experience
- Profile image

Create:

- Auth user
- Creator master record
- Creator account relationship

## Path B — Existing Creator Activation

Many creators may already exist because they registered for previous TAP events.

The system must allow Admin to invite an existing creator to activate their account.

When activated:

- Link the authenticated account to the existing Creator record.
- Do not create duplicate creator history.
- Preserve event registrations.
- Preserve attendance.
- Preserve sample claims.
- Preserve QR history.

Admin should be able to see whether a creator has:

- No portal account
- Invitation pending
- Active account
- Suspended account

---

# 4. Creator Portal Navigation

Build a mobile-first Creator Portal.

Recommended navigation:

```text
Dashboard
Available Campaigns
My Campaigns
Events
My Content
Performance
Earnings
Profile
```

On mobile, use a practical bottom navigation or compact responsive navigation for the highest-use sections.

---

# 5. Creator Dashboard

The dashboard should immediately answer:

- What opportunities are available?
- What campaigns am I currently working on?
- What do I need to submit?
- What events are coming up?
- How is my content performing?
- How much have I earned?

Suggested dashboard cards:

### Active Campaigns
Number of currently active campaign enrollments.

### Pending Applications
Campaign applications awaiting Admin review.

### Content Due
Number of outstanding campaign deliverables.

### Upcoming Events
Events the creator registered for or was approved for.

### Content Performance
Recent submitted video performance summary.

### Estimated Earnings
Current estimated/pending creator earnings.

Also show:

- Upcoming deadlines
- Recent campaign updates
- Recently submitted content
- Available campaigns
- Upcoming events

---

# 6. Affiliate Campaign Management — Admin

Affiliate Campaign creation must be done from the Admin Dashboard.

Add:

```text
Admin
  └── Campaigns
       ├── All Campaigns
       ├── Create Campaign
       ├── Applications
       ├── Enrolled Creators
       ├── Deliverables
       └── Campaign Reports
```

Create an `affiliate_campaigns` entity.

Recommended fields:

- id
- organization_id
- campaign_name
- campaign_slug
- seller_id (nullable if TAP-owned campaign)
- brand_id
- description
- objective
- start_date
- end_date
- application_start
- application_end
- content_deadline
- creator_capacity
- commission_type
- commission_rate
- fixed_creator_fee
- bonus_description
- campaign_requirements
- eligibility_requirements
- required_deliverables
- sample_available
- cover_image_url
- status
- created_by
- created_at
- updated_at

Campaign statuses:

- draft
- recruiting
- active
- content_production
- completed
- archived
- cancelled

Only appropriate published/recruiting campaigns should appear in Creator Portal → Available Campaigns.

---

# 7. Campaign Products

A campaign may contain one or multiple products.

Create a campaign-product relationship.

Suggested table:

`campaign_products`

Fields:

- id
- campaign_id
- product_id
- is_primary
- sample_available
- notes
- created_at

Use the existing Seller → Brand → Product structure wherever possible.

Do not duplicate product records just because a product belongs to a campaign.

---

# 8. Available Campaigns — Creator Portal

This is a core Creator Portal feature.

Route suggestion:

`/creator/campaigns`

Show campaigns currently accepting applications.

Campaign card should show useful information such as:

- Campaign image
- Campaign name
- Brand
- Product
- Commission
- Creator fee if applicable
- Required deliverables
- Content deadline
- Available creator slots where appropriate
- Application deadline
- Sample availability

Actions:

- View Campaign
- Apply Now

Do not expose internal Admin notes.

---

# 9. Campaign Details — Creator

Campaign detail page should contain:

- Campaign name
- Brand
- Product(s)
- Campaign description
- Campaign objective where creator-facing
- Commission structure
- Fixed creator fee
- Bonuses/incentives
- Deliverables
- Content requirements
- Sample availability
- Important dates
- Creator eligibility requirements
- Application deadline
- Content deadline
- Terms / campaign rules

Primary action:

`APPLY FOR CAMPAIGN`

If already applied, replace button with application status.

---

# 10. Campaign Applications

Create `campaign_applications`.

Recommended fields:

- id
- campaign_id
- creator_id
- status
- application_message
- application_answers JSONB if custom questions are supported
- applied_at
- reviewed_at
- reviewed_by
- rejection_reason
- created_at
- updated_at

Statuses:

- applied
- under_review
- approved
- rejected
- waitlisted
- withdrawn

Critical rule:

A Creator should not be able to submit multiple active applications to the same campaign.

Enforce this server-side/database-side.

---

# 11. Admin Campaign Application Review

Admin needs a campaign application management interface.

Admin can:

- View applicants
- Search creators
- Filter by status
- View creator profile
- View creator historical event participation
- View creator sample history where appropriate
- View existing performance data
- Approve
- Reject
- Waitlist
- Add internal notes

When Admin approves an application, create a Campaign Enrollment.

Do not use the application itself as the permanent campaign participation record.

---

# 12. Direct Creator Invitation

Admin must also be able to invite creators directly to campaigns.

This supports campaigns where TAP wants specific creators rather than waiting for applications.

Create an invitation/enrollment flow.

Possible flow:

```text
Admin selects Creator
→ Invite to Campaign
→ Creator receives invitation
→ Creator Accepts / Declines
→ Accepted creator becomes enrolled
```

A campaign can therefore receive creators through:

1. Creator application
2. Admin direct invitation

---

# 13. Campaign Enrollment

Create `campaign_enrollments`.

Recommended fields:

- id
- campaign_id
- creator_id
- application_id nullable
- invitation_id nullable
- status
- enrolled_at
- accepted_at
- completed_at
- assigned_product_id nullable
- unique_campaign_code
- creator_campaign_slug/token
- commission_rate_override nullable
- creator_fee_override nullable
- notes
- created_at
- updated_at

Enrollment statuses:

- invited
- active
- content_production
- submitted
- completed
- cancelled
- removed

One creator should have at most one active enrollment per campaign.

---

# 14. Unique Creator Campaign Link

Every enrolled creator should have a unique internal campaign link.

Example:

`/creator/campaigns/{campaign}/assignment/{unique-token}`

This is an INTERNAL TAP campaign assignment link.

It should identify:

- Creator
- Campaign
- Product assignment
- Deliverables
- Deadlines
- Campaign instructions
- Content submissions
- Earnings

Important:

Do not represent this internal URL as a TikTok affiliate sales attribution link.

If actual TikTok Shop affiliate/tracking links are integrated later, store those separately.

---

# 15. My Campaigns

Route suggestion:

`/creator/my-campaigns`

Organize into:

- Applied
- Invited
- Active
- Completed

Each campaign should clearly display its status.

Example lifecycle:

```text
Available
→ Applied
→ Under Review
→ Approved
→ Active
→ Content Production
→ Submitted
→ Completed
→ Paid
```

Payment status should remain separate from enrollment status.

---

# 16. Campaign Assignment Page

Once enrolled, creator should have a campaign workspace.

Show:

- Campaign
- Brand
- Assigned product(s)
- Campaign brief
- Deliverables
- Number of required videos
- Required LIVE sessions if applicable
- Content requirements
- Do / Don't rules
- Content deadline
- Commission
- Creator fee
- Bonuses
- Sample/product status
- Submission progress
- Earnings summary

Do not add AI-generated hooks or creative recommendations yet.

Reserve a future section for:

`AI Creative Brief`

but leave it inactive/placeholder if necessary.

---

# 17. Campaign Deliverables

Do not store deliverables only as plain text.

Create structured campaign deliverables so the system can track completion.

Suggested `campaign_deliverables`:

- id
- campaign_id
- deliverable_type
- title
- description
- required_quantity
- deadline
- requirements
- status

Deliverable types may include:

- tiktok_video
- tiktok_live
- ugc_video
- image_post
- other

Then create creator-specific deliverable assignments if needed:

`creator_deliverables`

- id
- campaign_enrollment_id
- campaign_deliverable_id
- creator_id
- status
- due_at
- completed_quantity
- created_at
- updated_at

Statuses:

- not_started
- in_progress
- submitted
- approved
- revision_requested
- completed

---

# 18. My Content

Create a Creator Portal section:

`/creator/content`

Creator should see:

- Content tasks
- Campaign
- Product
- Deliverable type
- Deadline
- Submission status
- Submitted TikTok URL

This page becomes very important in the next AI Creative Director phase.

Design it so AI-generated content tasks can be added later without restructuring the module.

---

# 19. TikTok Video URL Submission

Creators must be able to submit the public URL of a TikTok video they posted for a campaign.

Do NOT require video file upload for the primary workflow.

Create `content_submissions`.

Recommended fields:

- id
- creator_id
- campaign_id
- campaign_enrollment_id
- creator_deliverable_id
- platform
- public_url
- external_video_id nullable
- caption nullable
- submitted_at
- status
- reviewed_at nullable
- reviewed_by nullable
- review_notes nullable
- created_at
- updated_at

Platform initially:

- tiktok

Future:

- instagram
- facebook
- youtube
- shopee

Validate URL format.

Do not assume URL submission automatically provides all TikTok analytics.

The next AI Creative Director phase will implement automated URL processing, permitted data retrieval, video analysis, and creative intelligence.

---

# 20. Content Submission Status

Statuses:

- submitted
- processing
- reviewed
- approved
- revision_requested
- rejected

For this phase, Admin may manually review submissions.

Do not implement AI review yet.

Admin should be able to open the public URL from the submission record.

---

# 21. Performance Data Model

Even though automated TikTok analysis will be implemented later, create the data architecture now.

Create `content_metric_snapshots`.

Suggested fields:

- id
- content_submission_id
- creator_id
- campaign_id
- captured_at
- views nullable
- likes nullable
- comments nullable
- shares nullable
- saves nullable
- engagement_rate nullable
- clicks nullable
- orders nullable
- gmv nullable
- commission_generated nullable
- source
- raw_data JSONB nullable

This should support multiple snapshots for the same video so performance can be measured over time.

Do not hardcode the system around every metric being available.

Metrics must be nullable because availability depends on authorized platform data.

---

# 22. Creator Performance Page

Create:

`/creator/performance`

For now, show available data from content submissions and metric snapshots.

Suggested summary:

- Total submitted videos
- Total views
- Average views
- Total engagement
- Average engagement rate
- Campaigns completed
- Best-performing content

If no external metrics exist yet, show a proper empty state rather than fake/demo metrics in production.

Prepare the UI for future AI insights such as:

- Best hook type
- Best content format
- Best video duration
- Strongest product category
- Creator-specific creative recommendations

Do not implement those AI conclusions yet.

---

# 23. Events Inside Creator Portal

Existing TAP matchmaking events must now be accessible from the Creator Portal.

Create:

`/creator/events`

Sections:

- Available Events
- My Registrations
- Upcoming Events
- Past Events

Creator should be able to:

- View event
- Register for eligible/public event
- See registration status
- See approval status
- See check-in status after event starts
- Access their event QR when eligible/checked in according to current event logic

Reuse the existing event registration system.

Do not create a second event registration implementation specifically for portal users.

---

# 24. Creator Event History

Profile/dashboard should show event participation history.

Example:

```text
Davao Matchmaking
Approved
Checked In
4 samples claimed

Cebu Matchmaking
Approved
Did Not Attend
```

This should come from existing event registration, attendance and sample claim data.

---

# 25. Earnings System

Creators need to see commissions and fees.

Do not simply store one `earnings_total` field on the creator.

Create a ledger-based system.

Suggested `creator_earnings`:

- id
- creator_id
- campaign_id
- campaign_enrollment_id
- content_submission_id nullable
- earning_type
- description
- amount
- currency
- status
- source_reference nullable
- earned_at nullable
- approved_at nullable
- paid_at nullable
- created_at
- updated_at

Earning types:

- affiliate_commission
- creator_fee
- bonus
- adjustment

Statuses:

- estimated
- pending_validation
- approved
- processing
- paid
- cancelled

---

# 26. Creator Earnings Page

Create:

`/creator/earnings`

Show summary cards:

- Estimated Earnings
- Pending
- Approved
- Paid

Break down:

### Affiliate Commission

### Creator Fees

### Bonuses

### Payment History

Each transaction should show:

- Campaign
- Earning type
- Amount
- Status
- Date

Do not imply that estimated affiliate commission is final until validated.

---

# 27. Admin Earnings Management

Add Admin campaign/creator earnings management.

Admin can:

- Add creator fee
- Record commission
- Add bonus
- Approve earning
- Mark processing
- Mark paid
- Cancel/adjust entry with audit history

Do not permanently delete financial history.

Use adjustments/cancellations and audit logging.

---

# 28. Creator Profile

Create:

`/creator/profile`

Creator can manage allowed profile information.

Fields may include:

- Profile image
- Full name
- TikTok username
- TikTok profile URL
- Mobile
- Email where auth rules permit
- Location
- Creator categories
- Content niches
- Follower count
- GMV Max total
- Affiliate experience

Some performance fields may later become system-managed rather than creator-editable.

Design for this distinction now.

For example:

Creator editable:
- niche
- profile image
- profile URL

System-managed later:
- calculated performance
- campaign history
- verified GMV
- AI creator intelligence

---

# 29. Creator Notifications

Add an in-app notification architecture.

Creator should be notified when:

- Campaign application submitted
- Campaign application approved
- Campaign application rejected
- Campaign invitation received
- Campaign invitation accepted
- New deliverable/task assigned
- Deadline approaching
- Content submitted
- Revision requested
- Content approved
- New earning recorded
- Earning approved
- Payment marked paid
- Event registration approved
- Event reminder

Create a generic `notifications` table if one does not already exist.

Future push/email notifications can use the same events.

---

# 30. Creator Dashboard Recommended Layout

Desktop/tablet:

```text
------------------------------------------------------
Welcome back, Creator
------------------------------------------------------
Active Campaigns | Content Due | Earnings | Events
------------------------------------------------------

My Active Campaigns
[Campaign] [Campaign] [Campaign]

Content Due Soon
---------------------------------
Campaign | Deliverable | Deadline
---------------------------------

Available Campaigns
[Campaign Cards]

Upcoming Events
[Event Cards]

Recent Performance
[Metrics / Empty State]
------------------------------------------------------
```

Mobile should prioritize:

1. Content due
2. Active campaigns
3. Available campaigns
4. Earnings
5. Events

---

# 31. Admin Creator Management Enhancements

Update Admin → Creators.

Admin should see:

- Creator profile
- Portal account status
- TikTok account
- Campaign applications
- Active campaigns
- Campaign history
- Content submissions
- Event history
- Sample claim history
- Earnings
- Performance

Actions:

- Invite to portal
- Suspend portal access
- Invite to campaign
- View applications
- View content
- Add earning
- View event history

Do not remove existing creator/event functionality.

---

# 32. Suggested New Tables

Add or adapt the following:

```text
creator_accounts
affiliate_campaigns
campaign_products
campaign_applications
campaign_invitations
campaign_enrollments
campaign_deliverables
creator_deliverables
content_submissions
content_metric_snapshots
creator_earnings
notifications
```

Reuse existing:

```text
users
organizations
creators
events
event_registrations
event_attendance
creator_event_qr
sellers
brands
products
sample_claims
audit_logs
```

Do not create duplicate versions of existing entities unless migration requirements make it unavoidable.

---

# 33. Row Level Security / Authorization

Creator permissions must be strict.

A Creator can:

- Read/update allowed fields on their own profile
- View campaigns available to creators
- Apply to campaigns
- View only their own applications
- View only their own enrollments
- View only their own deliverables
- Create/view their own content submissions
- View only their own performance
- View only their own earnings
- View their own notifications
- View/register for available events
- View their own event history and QR where eligible

A Creator cannot:

- View another creator's private data
- View another creator's earnings
- View another creator's submissions
- Approve themselves for campaigns
- Change campaign commission
- Change campaign creator fee
- Mark themselves paid
- Create Admin campaigns
- Access Admin routes
- Access Seller routes

Enforce permissions at both application and database/RLS level.

---

# 34. Audit Logging

Add audit events for important Creator/Campaign actions:

- Creator account activated
- Creator invited to portal
- Campaign created
- Campaign published
- Campaign application submitted
- Campaign application approved/rejected
- Creator invited to campaign
- Campaign invitation accepted/declined
- Creator enrolled
- Deliverable assigned
- TikTok URL submitted
- Submission status changed
- Earning created
- Earning approved
- Earning marked paid
- Creator profile changed where appropriate

---

# 35. Data Integrity Rules

Implement database/server-side protection for at least:

1. One authenticated Creator account per Creator master profile.
2. No duplicate active campaign application for creator + campaign.
3. No duplicate active enrollment for creator + campaign.
4. Creator can submit content only against their own enrollment/deliverable.
5. Earnings must reference the correct creator/campaign relationship.
6. Creator cannot modify protected financial values.
7. Campaign application must be within allowed application dates unless Admin overrides it.
8. Creator cannot apply to a campaign that is not accepting applications.
9. Campaign capacity should be enforced when approving/enrolling creators, with Admin-safe handling of concurrent approvals.
10. Historical event data must remain attached when an existing Creator activates an account.

---

# 36. Prepare for AI Creative Director — But Do Not Build It Yet

The next phase will add the fully automated AI UGC Creative Director.

Therefore, design this phase so the following can be added without major database restructuring:

### Future Video URL Pipeline

```text
Creator submits TikTok URL
→ URL validation
→ Authorized/public data retrieval where permitted
→ Video/media analysis
→ Transcript
→ Hook analysis
→ Visual analysis
→ Product/USP analysis
→ Metrics snapshots
→ AI creative report
→ Creator intelligence update
→ Campaign intelligence update
→ Next content recommendation
→ Automated task assignment
```

Future tables may include:

```text
video_analysis_jobs
video_creative_analysis
creator_intelligence_profiles
campaign_creative_intelligence
creative_hooks
creative_angles
creative_briefs
ai_content_recommendations
ai_generated_tasks
```

For now, ensure `content_submissions`, `content_metric_snapshots`, creators, campaigns, products and deliverables have stable IDs and clean relationships.

---

# 37. Explicitly Out of Scope for This Phase

Do NOT implement yet:

- AI video analysis
- AI hook analysis
- AI Creative Director
- Automated competitor research
- Automated TikTok trend research
- AI-generated briefs
- AI-generated creator tasks
- Autonomous campaign optimization
- Automated video downloading/scraping
- Automated creator scoring
- Automated creator-to-product matching

These belong to the next phase.

This phase should create the reliable Creator Portal and campaign/content data foundation those AI features require.

---

# 38. Implementation Order

Implement incrementally.

## Step 1 — Creator Authentication

- Creator role/account type
- Creator account relationship
- Creator login
- Role-based redirect
- Creator route protection

## Step 2 — Creator Portal Shell

- Navigation
- Dashboard
- Profile
- Responsive/mobile layout

## Step 3 — Admin Affiliate Campaigns

- Campaign CRUD
- Campaign products
- Publish/recruiting states
- Creator-facing campaign visibility

## Step 4 — Available Campaigns

- Creator campaign discovery
- Campaign details
- Apply

## Step 5 — Applications & Invitations

- Applications
- Admin review
- Direct invitations
- Accept/decline

## Step 6 — Campaign Enrollment

- Enrollment model
- My Campaigns
- Campaign assignment workspace
- Unique internal creator campaign link

## Step 7 — Deliverables

- Structured campaign deliverables
- Creator deliverable assignments
- Deadline tracking

## Step 8 — Content Submission

- My Content
- TikTok public URL submission
- Submission history
- Admin manual review

## Step 9 — Performance Foundation

- Metric snapshot data model
- Creator performance UI
- Empty states where metrics are unavailable

## Step 10 — Earnings

- Earnings ledger
- Creator earnings dashboard
- Admin earnings management

## Step 11 — Events Integration

- Available events in Creator Portal
- Existing registration integration
- Creator event history
- QR access

## Step 12 — Notifications, RLS & Audit

- Notifications
- RLS policies
- Authorization tests
- Audit logs
- Data integrity tests

---

# 39. Acceptance Tests

This phase is complete only when the following work.

## Creator Account

- Creator can sign up/login.
- Creator is redirected to `/creator`.
- Creator cannot access `/admin` or `/seller`.
- Existing event creator can activate an account without losing historical records.

## Campaign Discovery

- Admin can create an Affiliate Campaign.
- Admin can publish/open campaign recruitment.
- Published recruiting campaign appears in Creator Portal → Available Campaigns.
- Draft campaign does not appear.
- Creator can open campaign details.

## Campaign Application

- Creator can apply.
- Creator cannot apply twice.
- Application appears in Admin.
- Admin can approve/reject/waitlist.
- Approved application creates enrollment.

## Invitation

- Admin can directly invite Creator.
- Creator sees invitation.
- Creator can accept/decline.
- Accepted invitation creates/activates enrollment.

## My Campaigns

- Creator sees active campaigns.
- Creator sees campaign assignment details.
- Creator sees commission and creator fee.
- Creator sees deliverables and deadlines.
- Creator has a unique internal campaign assignment URL/token.

## Content

- Creator can see assigned deliverables.
- Creator can submit a valid public TikTok URL.
- Submission is linked to correct creator, campaign and deliverable.
- Creator cannot submit content for another creator's enrollment.
- Admin can review submitted URLs.

## Performance

- Metric snapshot architecture exists.
- Creator can see only their own metrics.
- Missing metrics produce clean empty states.

## Earnings

- Admin can create commission/fee/bonus entries.
- Creator sees their own earnings.
- Estimated/pending/approved/paid statuses are distinct.
- Creator cannot modify financial amounts or payment status.

## Events

- Creator sees available events.
- Creator can use the existing event registration workflow.
- Creator sees their historical event registrations.
- Existing attendance/sample history remains intact.

## Security

- Creator cannot access another creator's records by changing IDs/URLs.
- Creator cannot access Admin/Seller APIs through direct requests.
- RLS protects creator-specific data.

---

# 40. Final Instruction to Codex

Before changing code:

1. Inspect the existing repository and database schema.
2. Identify existing authentication, roles, creator, event, seller, brand, product, QR, sample claim and audit implementations.
3. Reuse existing architecture rather than duplicating functionality.
4. Produce a concise implementation plan and migration plan.
5. Then implement this phase incrementally.
6. Preserve all existing event matchmaking functionality.
7. Add migrations safely and avoid destructive schema changes unless absolutely necessary.
8. Add loading, empty, success and error states for all new Creator Portal screens.
9. Keep the Creator Portal mobile-first.
10. Add tests for authorization and critical database constraints.
11. Do not begin the AI UGC Creative Director implementation during this phase.

The goal of this phase is to establish a production-ready Creator ecosystem:

**Creator Account → Available Campaigns → Apply/Invitation → Enrollment → Deliverables → TikTok URL Submission → Performance Foundation → Earnings → Events**

Once this is stable, the next development phase will connect the AI UGC Creative Director to the content submission and performance pipeline.
