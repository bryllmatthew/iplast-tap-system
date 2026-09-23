export type Role = "super_admin" | "event_admin" | "event_staff" | "seller_admin" | "seller_staff" | "creator";

export type EventStatus =
  | "draft"
  | "published"
  | "registration_closed"
  | "ongoing"
  | "completed"
  | "cancelled";

export type RegistrationStatus = "pending" | "approved" | "rejected" | "waitlisted" | "cancelled";
export type AttendanceStatus = "not_checked_in" | "checked_in" | "checked_out";
export type ClaimStatus = "claimed" | "cancelled" | "reversed";
export type FieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "number"
  | "url"
  | "single_select"
  | "multi_select"
  | "checkbox"
  | "date"
  | "file";

export type Event = {
  id: string;
  event_name: string;
  event_slug: string;
  description: string;
  venue: string;
  address: string;
  event_date: string;
  start_time: string;
  end_time: string;
  registration_start: string;
  registration_end: string;
  maximum_creator_capacity: number;
  poster_url: string;
  status: EventStatus;
};

export type FormField = {
  id: string;
  label: string;
  field_type: FieldType;
  required: boolean;
  options?: string[];
  sort_order: number;
};

export type FormVersion = {
  id: string;
  event_id: string;
  version_number: number;
  status: "draft" | "published" | "archived";
  fields: FormField[];
  published_at: string;
};

export type Creator = {
  id: string;
  full_name: string;
  tiktok_username: string;
  tiktok_profile_url: string;
  email: string;
  mobile: string;
  location: string;
  follower_count: number;
  gmv_max_total: number;
  creator_category: string;
  content_categories: string[];
  affiliate_experience: string;
  profile_image?: string;
  notes?: string;
};

export type CreatorAccount = {
  id: string;
  creator_id: string;
  user_id: string;
  email: string;
  status: "pending" | "active" | "suspended";
  invited_by?: string;
  invited_at: string;
  activated_at?: string;
  created_at: string;
  updated_at: string;
};

export type FormResponse = {
  id: string;
  event_id: string;
  creator_id: string;
  form_version_id: string;
  field_snapshot: FormField[];
  answers: Record<string, unknown>;
  submitted_at: string;
};

export type Registration = {
  id: string;
  event_id: string;
  creator_id: string;
  form_response_id: string;
  registration_status: RegistrationStatus;
  registered_at: string;
  approved_at?: string;
  notes?: string;
};

export type Attendance = {
  id: string;
  event_id: string;
  creator_id: string;
  registration_id: string;
  status: AttendanceStatus;
  checked_in_at?: string;
  checked_in_by?: string;
};

export type CreatorQr = {
  id: string;
  event_id: string;
  creator_id: string;
  registration_id: string;
  attendance_id?: string;
  qr_token: string;
  qr_url: string;
  status: "pending_approval" | "approved_not_checked_in" | "active" | "revoked";
  generated_at: string;
  last_scanned_at?: string;
};

export type Seller = {
  id: string;
  company_name: string;
  contact_name: string;
  username: string;
  email: string;
  phone: string;
  shop_code?: string;
  shop_link?: string;
  open_plan_commission: number;
  tap_commission: number;
  logo_url?: string;
  status: "active" | "inactive";
};

export type SellerInvite = {
  id: string;
  seller_id: string;
  username?: string;
  email: string;
  login_url: string;
  temporary_password: string;
  created_at: string;
  status: "queued" | "sent";
};

export type Brand = {
  id: string;
  seller_id: string;
  brand_name: string;
  logo_url?: string;
  description: string;
  status: "active" | "inactive";
};

export type Product = {
  id: string;
  brand_id: string;
  product_name: string;
  sku: string;
  pid?: string;
  product_link?: string;
  image_url?: string;
  description: string;
  sample_inventory: number;
  max_claims_per_creator: number;
  status: "active" | "inactive";
};

export type EventSeller = {
  id: string;
  event_id: string;
  seller_id: string;
  booth_name: string;
  booth_number: string;
  status: "active" | "inactive";
};

export type EventProduct = {
  id: string;
  event_id: string;
  product_id: string;
  available_quantity: number;
  max_claims_per_creator: number;
  status: "active" | "inactive";
};

export type SampleClaim = {
  id: string;
  event_id: string;
  creator_id: string;
  seller_id: string;
  brand_id: string;
  product_id: string;
  quantity: number;
  claimed_at: string;
  claimed_by: string;
  booth_id?: string;
  qr_scan_id?: string;
  status: ClaimStatus;
};

export type RegistrationRow = {
  registration: Registration;
  creator: Creator;
  attendance?: Attendance;
  response?: FormResponse;
  qr?: CreatorQr;
};

export type VerifiedCreator = {
  event: Event;
  creator: Creator;
  qr: CreatorQr;
  registration: Registration;
  attendance: Attendance;
  alreadyClaimedProductIds: string[];
};

export type QrValidation =
  | {
      ok: true;
      code: "eligible";
      message: string;
      data: VerifiedCreator;
    }
  | {
      ok: false;
      code: "not_found" | "wrong_event" | "pending_approval" | "not_checked_in" | "revoked";
      message: string;
      event?: Event;
      creator?: Creator;
      qr?: CreatorQr;
      registration?: Registration;
      attendance?: Attendance;
    };
