"use client";

import { useFilterAutoApply } from "./use-filter-auto-apply";

export function ArchiveFilterAutoApply(props: {
  formId: string;
  filterValues: Record<string, string>;
  debounceMs?: number;
}) {
  useFilterAutoApply(props);
  return null;
}
