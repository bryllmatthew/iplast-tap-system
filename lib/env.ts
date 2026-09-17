const canonicalSiteUrl = "https://tap.iplast.ai";

export function siteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl || configuredUrl.includes("vercel.app")) {
    return canonicalSiteUrl;
  }

  return configuredUrl.replace(/\/+$/, "");
}

export function appUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl()}${normalizedPath}`;
}

export function canonicalAppUrl(value: string | undefined, fallbackPath: string) {
  if (!value || value.includes("vercel.app")) {
    return appUrl(fallbackPath);
  }

  return value;
}

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
