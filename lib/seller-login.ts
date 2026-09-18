const sellerAuthEmailDomain = "seller.tap.iplast.ai";

export function normalizeSellerUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^@+/, "")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sellerUsernameToAuthEmail(username: string) {
  const normalized = normalizeSellerUsername(username);
  return `${normalized}@${sellerAuthEmailDomain}`;
}

export function sellerAuthEmailFromIdentifier(identifier: string) {
  const trimmed = identifier.trim().toLowerCase();
  if (trimmed.includes("@")) return trimmed;
  return sellerUsernameToAuthEmail(trimmed);
}
