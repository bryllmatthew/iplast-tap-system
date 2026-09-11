export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://tap.iplast.ai";
}

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
