"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Navigation from "@/app/components/Navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";

type SiteChromeProps = {
  children: ReactNode;
  editorialPaths: readonly string[];
};

export function SiteChrome({ children, editorialPaths }: SiteChromeProps) {
  const pathname = usePathname();
  // The URL shape alone cannot prove that an article exists. On an unknown
  // /guide/:slug or /column/:slug, the server renders a 404 while the browser
  // still sees the requested pathname; guessing from a regex therefore causes
  // the two trees to disagree during hydration. The server-owned publication
  // Registry supplies the exact paths that may use article chrome.
  const editorialArticle = editorialPaths.includes(pathname.replace(/\/$/u, ""));

  // v2: 全ページ同一クローム（記事詳細の没入レイアウトのみ現行維持）
  return (
    <div className={editorialArticle ? "flex min-h-screen flex-col bg-white" : "flex min-h-screen flex-col bg-[var(--paper)]"}>
      {editorialArticle ? null : <Navigation />}
      <div id={editorialArticle ? undefined : "cb-main"} tabIndex={editorialArticle ? undefined : -1} className="flex-1 pt-0 outline-none">
        {children}
      </div>
      {editorialArticle ? null : <SiteFooter />}
    </div>
  );
}
