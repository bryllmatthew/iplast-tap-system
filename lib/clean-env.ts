export function cleanEnv(value: string | undefined) {
  return value
    ?.replace(/\uFEFF/g, "")
    .trim()
    .replace(/^"(.*)"$/, "$1");
}
