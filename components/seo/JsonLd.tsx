import React from "react";

type JsonLdType = "Article" | "Product" | "BreadcrumbList";

interface JsonLdProps {
  type?: JsonLdType;
  data: Record<string, unknown>;
  id?: string;
}

/**
 * A deliberately transparent JSON-LD renderer. Authorship must be resolved by
 * the caller and is verified at build time; this component never invents or
 * rewrites a Person entity.
 */
export const JsonLd: React.FC<JsonLdProps> = ({ type, data, id }) => {
  const resolvedType = type ?? data["@type"];
  const jsonLd = {
    "@context": "https://schema.org",
    ...(resolvedType ? { "@type": resolvedType } : {}),
    ...data,
  };

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};
