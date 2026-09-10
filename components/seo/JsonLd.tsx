import { serializeJsonLd } from "@/lib/seo/serialize-json";

type JsonLdProps = {
  type?: "Article" | "Product" | "BreadcrumbList";
  data: Record<string, unknown>;
  id?: string;
};

/** Serialize authored metadata without inventing an author or reviewer. */
export function JsonLd({ type, data, id }: JsonLdProps) {
  const value = {
    "@context": "https://schema.org",
    ...(type ? { "@type": type } : {}),
    ...data,
  };
  return <script id={id} type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: serializeJsonLd(value) }} />;
}
