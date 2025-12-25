// components/page/DetailPageScaffold.tsx

import React from "react";

import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";
import { JsonLd } from "@/components/seo/JsonLd";

type JsonLdEntry = {
  id?: string;
  type?: "Article" | "Product" | "BreadcrumbList";
  data: any;
};

type DetailPageScaffoldProps = {
  /** Optional JSON-LD blocks to render. */
  jsonLd?: JsonLdEntry[];
  children: React.ReactNode;
};

/**
 * Common wrapper for detail pages (cars / guide / column / heritage).
 * - Injects scroll-depth tracker.
 * - Optionally injects JSON-LD scripts.
 */
export function DetailPageScaffold({ jsonLd, children }: DetailPageScaffoldProps) {
  return (
    <>
      <ScrollDepthTracker />
      {Array.isArray(jsonLd) &&
        jsonLd.map((entry, i) => (
          <JsonLd
            key={entry.id ?? `jsonld-${i}`}
            id={entry.id}
            type={entry.type}
            data={entry.data}
          />
        ))}
      {children}
    </>
  );
}
