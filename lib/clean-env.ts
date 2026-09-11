export function cleanEnv(value: string | undefined) {
  return value?.replace(/^\uFEFF/, "").trim();
}
