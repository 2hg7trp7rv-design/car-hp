import Link from "next/link";
import { CookieSettingsButton } from "@/components/analytics/CookieSettingsButton";

const CONTENT_LINKS = [
  { href: "/cars", label: "車種一覧" },
  { href: "/guide", label: "ガイド" },
  { href: "/column", label: "コラム" },
  { href: "/heritage", label: "系譜特集" },
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
      className="relative z-20 isolate overflow-hidden border-t border-white/[0.045] bg-[#030404] text-white"
    >
      <div className="mx-auto w-full max-w-[920px] px-[clamp(24px,5.8svw,58px)] pb-[clamp(140px,18svh,188px)] pt-[clamp(58px,9svh,96px)]">
        <div>
          <Link href="/" className="inline-block w-fit">
            <span className="block font-editorial text-[clamp(23px,6.15svw,44px)] uppercase leading-none tracking-[0.26em] text-white/[0.94]">
              CAR BOUTIQUE
            </span>
            <span className="mt-[clamp(13px,1.9svh,18px)] block text-[clamp(9px,2.2svw,13px)] uppercase leading-none tracking-[0.48em] text-white/[0.26]">
              JOURNAL
            </span>
          </Link>

          <p className="mt-[clamp(38px,6.2svh,62px)] max-w-[49rem] text-[clamp(14px,3.2svw,24px)] leading-[1.9] tracking-[0.045em] text-white/[0.34]">
            車に関する全てがここにある<br />
            車選びから売却、整備修理、カスタム、車や自動車メーカーの歴史まで見られる自動車メディア
          </p>


        </div>

        <div className="mt-[clamp(58px,8.8svh,94px)] grid grid-cols-1 gap-y-[clamp(70px,10svh,96px)]">
          <section>
            <p className="text-[clamp(10px,2.4svw,13px)] leading-none tracking-[0.44em] text-white/[0.22]">コンテンツ</p>
            <nav className="mt-[clamp(34px,5.2svh,54px)] flex flex-col gap-[clamp(32px,4.9svh,44px)]" aria-label="コンテンツ">
              {CONTENT_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[clamp(16px,4.2svw,28px)] leading-none tracking-[0.055em] text-white/[0.38] transition-colors hover:text-white/[0.82]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </section>

          <section>
            <p className="text-[clamp(10px,2.4svw,13px)] leading-none tracking-[0.44em] text-white/[0.22]">サイト</p>
            <nav className="mt-[clamp(34px,5.2svh,54px)] flex flex-col gap-[clamp(32px,4.9svh,44px)]" aria-label="サイト">
              {SITE_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[clamp(16px,4.2svw,28px)] leading-none tracking-[0.04em] text-white/[0.38] transition-colors hover:text-white/[0.82]"
                >
                  {item.label}
                </Link>
              ))}
              <CookieSettingsButton className="text-left text-sm text-white/80 underline underline-offset-4" />
            </nav>
          </section>
        </div>
      </div>
    </footer>
  );
}
