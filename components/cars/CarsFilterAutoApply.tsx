"use client";

import { useCallback } from "react";

import { useFilterAutoApply } from "@/components/archive/use-filter-auto-apply";
import { usePageContext } from "@/lib/analytics/pageContext";
import { trackCarsFilterApply } from "@/lib/analytics/events";

function safeString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function CarsFilterAutoApply(props: {
  formId: string;
  filterValues: Record<string, string>;
  debounceMs?: number;
}) {
  const { page_type, content_id } = usePageContext();
  const track = useCallback((form: HTMLFormElement, source: string) => {
    const data = new FormData(form);
    trackCarsFilterApply({
      page_type: page_type === "cars" ? "cars_index" : page_type,
      content_id,
      q: safeString(data.get("q")),
      maker: safeString(data.get("maker")),
      bodyType: safeString(data.get("bodyType")),
      segment: safeString(data.get("segment")),
      sort: safeString(data.get("sort")),
      minYear: safeString(data.get("minYear")),
      maxYear: safeString(data.get("maxYear")),
      minPrice: safeString(data.get("minPrice")),
      maxPrice: safeString(data.get("maxPrice")),
      priceBand: safeString(data.get("priceBand")),
      perPage: safeString(data.get("perPage")),
      view: safeString(data.get("view")),
      source,
    });
  }, [page_type, content_id]);

  useFilterAutoApply({ ...props, onApply: track });
  return null;
}
