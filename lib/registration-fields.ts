import type { FieldType, FormField } from "@/lib/types";

export type RegistrationFieldDefinition = FormField & {
  placeholder?: string;
  group: "Core" | "TikTok" | "Shopee" | "Facebook" | "Commerce";
  defaultSelected: boolean;
};

export const registrationFieldCatalog: RegistrationFieldDefinition[] = [
  { id: "full_name", label: "Name", field_type: "short_text", required: true, sort_order: 1, group: "Core", defaultSelected: true },
  { id: "email", label: "Email", field_type: "email", required: false, sort_order: 2, group: "Core", defaultSelected: true },
  { id: "mobile", label: "Viber Number", field_type: "phone", required: false, sort_order: 3, group: "Core", defaultSelected: true },
  { id: "location", label: "Location", field_type: "short_text", required: false, sort_order: 4, group: "Core", defaultSelected: true },
  {
    id: "creator_category",
    label: "Creator Category",
    field_type: "single_select",
    required: false,
    options: ["Beauty", "Fashion", "Food", "Electronics", "Home", "Health", "Lifestyle"],
    sort_order: 5,
    group: "Core",
    defaultSelected: true
  },
  {
    id: "content_categories",
    label: "Content Categories/Niche",
    field_type: "multi_select",
    required: false,
    options: ["Beauty", "Fashion", "Food", "Electronics", "Home", "Health", "Lifestyle"],
    sort_order: 6,
    group: "Core",
    defaultSelected: true
  },
  {
    id: "affiliate_experience",
    label: "Content Format",
    field_type: "single_select",
    required: false,
    options: ["LIVE Only", "Video Only", "Both LIVE and Video"],
    sort_order: 7,
    group: "Core",
    defaultSelected: true
  },
  {
    id: "tiktok_username",
    label: "TikTok Username  (@xxxxxx)",
    field_type: "short_text",
    required: false,
    placeholder: "@xxxxxx",
    sort_order: 8,
    group: "TikTok",
    defaultSelected: true
  },
  {
    id: "tiktok_profile_url",
    label: "TikTok Profile link",
    field_type: "url",
    required: false,
    placeholder: "https://www.tiktok.com/@xxxxxx",
    sort_order: 9,
    group: "TikTok",
    defaultSelected: true
  },
  { id: "follower_count", label: "TikTok Followers", field_type: "number", required: false, sort_order: 10, group: "TikTok", defaultSelected: true },
  { id: "tiktok_last_month_gmv", label: "TikTok Last Month GMV", field_type: "number", required: false, sort_order: 11, group: "TikTok", defaultSelected: true },
  {
    id: "shopee_username",
    label: "Shopee username",
    field_type: "short_text",
    required: false,
    placeholder: "shopeeusername",
    sort_order: 12,
    group: "Shopee",
    defaultSelected: true
  },
  {
    id: "shopee_profile_link",
    label: "Shopee profile link",
    field_type: "url",
    required: false,
    placeholder: "https://shopee.ph/...",
    sort_order: 13,
    group: "Shopee",
    defaultSelected: true
  },
  {
    id: "shopee_affiliate_status",
    label: "Shopee Affiliate Status",
    field_type: "single_select",
    required: false,
    options: ["Active", "Application Pending", "Not yet registered"],
    sort_order: 14,
    group: "Shopee",
    defaultSelected: true
  },
  { id: "shopee_follower_count", label: "Shopee Followers", field_type: "number", required: false, sort_order: 15, group: "Shopee", defaultSelected: true },
  { id: "shopee_last_month_gmv", label: "Shopee Last Month GMV", field_type: "number", required: false, sort_order: 16, group: "Shopee", defaultSelected: true },
  {
    id: "facebook_username",
    label: "Facebook username",
    field_type: "short_text",
    required: false,
    placeholder: "facebook.username",
    sort_order: 17,
    group: "Facebook",
    defaultSelected: true
  },
  {
    id: "facebook_profile_link",
    label: "Facebook profile link",
    field_type: "url",
    required: false,
    placeholder: "https://facebook.com/...",
    sort_order: 18,
    group: "Facebook",
    defaultSelected: true
  },
  {
    id: "facebook_follower_count",
    label: "Facebook Follower Count",
    field_type: "number",
    required: false,
    sort_order: 19,
    group: "Facebook",
    defaultSelected: true
  }
];

export function toFormField(field: RegistrationFieldDefinition): FormField {
  return {
    id: field.id,
    label: field.label,
    field_type: field.field_type as FieldType,
    required: field.required,
    options: field.options,
    sort_order: field.sort_order
  };
}

export function defaultRegistrationFields() {
  return registrationFieldCatalog.filter((field) => field.defaultSelected).map(toFormField);
}

export function registrationFieldsFromFormData(formData: FormData) {
  const selectedIds = new Set(formData.getAll("registration_fields").map(String));
  const requiredIds = new Set(formData.getAll("required_registration_fields").map(String));
  const selected = registrationFieldCatalog.filter((field) => field.required || selectedIds.has(field.id) || requiredIds.has(field.id));
  const fields = selected.length ? selected : registrationFieldCatalog.filter((field) => field.defaultSelected);

  return fields.map((field) => ({
    ...toFormField(field),
    required: field.required || requiredIds.has(field.id)
  }));
}

export function registrationFieldPlaceholder(fieldId: string) {
  return registrationFieldCatalog.find((field) => field.id === fieldId)?.placeholder;
}
