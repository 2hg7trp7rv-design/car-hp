import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleDesignSystemCatalog } from "@/components/articleDesignSystem/ArticleDesignSystemCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CBJ記事デザインシステム 開発用カタログ",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export default function ArticleSystemPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ArticleDesignSystemCatalog />;
}
