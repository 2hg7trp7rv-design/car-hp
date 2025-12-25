// lib/seo/detail-metadata.ts

import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site";

type Args = {
  title: string;
  description: string;
  canonicalPath: string; // e.g. /guide/foo
  ogImage?: string | null;
};

export function buildDetailMetadata(args: Args): Metadata {
  const url = `${getSiteUrl()}${args.canonicalPath}`;
  const images = args.ogImage ? [args.ogImage] : [];

  return {
    title: args.title,
    description: args.description,
    alternates: { canonical: url },
    openGraph: {
      title: args.title,
      description: args.description,
      url,
      siteName: "CAR BOUTIQUE",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description: args.description,
      images,
    },
  };
}
