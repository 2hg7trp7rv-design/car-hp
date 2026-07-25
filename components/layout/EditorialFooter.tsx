"use client";

import Link from "next/link";

const CONTENT_LINKS = [
  { href: "/guide", label: "ガイド" },
  { href: "/column", label: "コラム" },
] as const;

const SITE_LINKS = [
  { href: "/legal/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal", label: "Terms" },
] as const;

export function EditorialFooter() {
  return (
    <footer
      data-cbj-editorial-footer
      className="relative z-20 isolate overflow-hidden border-t border-[var(--line)] bg-[var(--paper)] text-[var(--ink)]"
    >
      <div className="mx-auto w-full max-w-[1080px] px-[clamp(24px,5.8svw,58px)] pb-[clamp(64px,10svh,96px)] pt-[clamp(48px,7svh,72px)]">
        <div>
          <Link href="/" className="inline-block w-fit">
            <span className="block font-editorial text-[clamp(20px,4.6svw,30px)] font-bold uppercase leading-none tracking-[0.3em] text-[var(--ink)]">
              CBJ
            </span>
            <span className="mt-[clamp(10px,1.6svh,14px)] block text-[clamp(9px,2.2svw,12px)] uppercase leading-none tracking-[0.42em] text-[var(--ink-soft)]">
              CAR BOUTIQUE JOURNAL
            </span>
          </Link>

          <p className="mt-[clamp(28px,4.6svh,44px)] max-w-[49rem] text-[clamp(13px,2.6svw,16px)] leading-[1.9] tracking-[0.03em] text-[var(--ink-soft)]">
            車の仕組みを、迷わず読める形へ。<br />
            カスタム・整備・維持判断を、初心者でも追える順番で整理する自動車メディア。
          </p>
        </div>

        <div className="mt-[clamp(40px,6svh,60px)] grid grid-cols-2 gap-y-[clamp(32px,5svh,48px)]">
          <section>
            <p className="font-editorial text-[clamp(10px,2.2svw,12px)] font-bold lowercase leading-none tracking-[0.34em] text-[var(--ink-soft)]">
              contents
            </p>
            <nav className="mt-[clamp(20px,3svh,28px)] flex flex-col gap-[clamp(16px,2.6svh,22px)]" aria-label="コンテンツ">
              {CONTENT_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="w-fit text-[clamp(14px,3svw,17px)] leading-none tracking-[0.05em] text-[var(--ink-soft)] transition-colors hover:text-[var(--teal)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </section>

          <section>
            <p className="font-editorial text-[clamp(10px,2.2svw,12px)] font-bold lowercase leading-none tracking-[0.34em] text-[var(--ink-soft)]">
              site
            </p>
            <nav className="mt-[clamp(20px,3svh,28px)] flex flex-col gap-[clamp(16px,2.6svh,22px)]" aria-label="サイト">
              {SITE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="w-fit text-[clamp(14px,3svw,17px)] leading-none tracking-[0.04em] text-[var(--ink-soft)] transition-colors hover:text-[var(--teal)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </section>
        </div>
      </div>
    </footer>
  );
}
