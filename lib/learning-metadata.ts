import type { Metadata } from "next";

export function referenceMetadata(title: string, description: string, path: string): Metadata {
  const image = "/images/cbj/learning/hero.webp";
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title, description, siteName: "CAR BOUTIQUE JOURNAL", images: [{ url: image, width: 1536, height: 1024, alt: "シュナと莉奈と図解で学ぶ、クルマの参考書" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
