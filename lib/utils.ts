// lib/utils.ts
export function cn(
  ...inputs: Array<string | number | false | null | undefined>
): string {
  return inputs
    .filter((v) => typeof v === "string" || typeof v === "number")
    .map((v) => String(v))
    .join(" ");
}
