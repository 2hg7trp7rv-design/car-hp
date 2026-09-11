/** JSON string escaping alone does not protect the surrounding HTML script element. */
export function serializeJsonLd(value: Record<string, unknown>): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
