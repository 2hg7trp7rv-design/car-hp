import Link from "next/link";
import { CookieSettingsButton } from "@/components/analytics/CookieSettingsButton";

/** Shared by every article template; keep utility destinations in one place. */
export function ArticleFooter() {
  return (
    <footer className="border-t border-black/10 bg-[#fffdf8] px-6 py-10 text-sm text-[#2b2b33]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
        <Link href="/" className="font-semibold">CAR BOUTIQUE JOURNAL</Link>
        <nav aria-label="記事フッター" className="flex flex-wrap gap-x-6 gap-y-3">
          <Link href="/guide">ガイド</Link>
          <Link href="/column">コラム</Link>
          <Link href="/legal">運営情報</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/contact">Contact</Link>
          <CookieSettingsButton />
        </nav>
      </div>
    </footer>
  );
}
