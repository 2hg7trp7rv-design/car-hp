import Link from "next/link";

import HeroSection from "@/app/sections/HeroSection";
import HomeEditorialSequence from "@/app/sections/HomeEditorialSequence";
import { getLatestGuides } from "@/lib/guides";
import { getAllColumns } from "@/lib/columns";
import { resolveGuideCardImage, resolveColumnCardImage } from "@/lib/display-tag-media";

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}.${m}.${day}`;
}

type LatestCard = {
  type: "GUIDE" | "COLUMN";
  href: string;
  title: string;
  deck: string;
  date: string;
  image: string | null;
  publishedAt: number;
};

export default async function Home() {
  const [guides, columns] = await Promise.all([getLatestGuides(4), getAllColumns()]);

  const latest: LatestCard[] = [
    ...guides.map((g): LatestCard => ({
      type: "GUIDE",
      href: `/guide/${encodeURIComponent(g.slug)}`,
      title: g.title,
      deck: String(g.summary ?? g.lead ?? ""),
      date: formatDate(g.publishedAt ?? g.updatedAt ?? null),
      image: resolveGuideCardImage(g),
      publishedAt: new Date(g.publishedAt ?? g.updatedAt ?? 0).getTime() || 0,
    })),
    ...columns.map((c): LatestCard => ({
      type: "COLUMN",
      href: `/column/${encodeURIComponent(c.slug)}`,
      title: c.title,
      deck: String(c.summary ?? c.lead ?? ""),
      date: formatDate(c.publishedAt ?? c.updatedAt ?? null),
      image: resolveColumnCardImage(c),
      publishedAt: new Date(c.publishedAt ?? c.updatedAt ?? 0).getTime() || 0,
    })),
  ]
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, 3);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <HeroSection />
      <HomeEditorialSequence />

      {/* Latest — 新着記事 */}
      <section className="relative z-10 mx-auto w-full max-w-[1080px] px-[clamp(20px,5svw,44px)] py-[clamp(64px,10svh,104px)]">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-editorial text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--teal)]">
              Latest
            </p>
            <h2 className="mt-3 text-[clamp(26px,4.6svw,40px)] font-bold leading-[1.15] tracking-[-0.02em]">
              新着記事
            </h2>
          </div>
          <Link
            href="/guide"
            className="hidden shrink-0 text-[12px] font-medium tracking-[0.16em] text-[var(--ink-soft)] transition-colors hover:text-[var(--teal)] sm:block"
          >
            すべて見る ↗
          </Link>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col overflow-hidden rounded-[14px] border border-[var(--line)] bg-white shadow-[0_1px_3px_rgba(31,35,40,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(31,35,40,0.12)]"
            >
              {item.image ? (
                <div className="relative aspect-[16/9] overflow-hidden bg-[var(--surface-2)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 font-editorial text-[10px] font-bold uppercase tracking-[0.18em] text-white ${
                      item.type === "GUIDE" ? "bg-[var(--teal)]" : "bg-[var(--coral)]"
                    }`}
                  >
                    {item.type}
                  </span>
                  {item.date ? (
                    <span className="text-[11px] tracking-[0.08em] text-[var(--ink-soft)]">{item.date}</span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-[16px] font-bold leading-[1.5] tracking-[-0.01em] text-[var(--ink)] transition-colors group-hover:text-[var(--teal)]">
                  {item.title}
                </h3>
                {item.deck ? (
                  <p className="mt-2 line-clamp-2 text-[13px] leading-[1.8] text-[var(--ink-soft)]">
                    {item.deck}
                  </p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial Board — ダークセクション（v2で唯一残す重厚セクション） */}
      <section className="relative z-10 bg-[var(--navy)] text-white">
        <div className="mx-auto w-full max-w-[1080px] px-[clamp(20px,5svw,44px)] py-[clamp(72px,11svh,120px)]">
          <p className="font-editorial text-[11px] font-bold uppercase tracking-[0.32em] text-white/50">
            Editorial Board
          </p>
          <h2 className="mt-4 max-w-[26ch] text-[clamp(26px,4.8svw,42px)] font-bold leading-[1.35] tracking-[-0.01em] text-white">
            一次資料主義。断言より、確認できることを。
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            <div>
              <p className="font-editorial text-[12px] font-bold tracking-[0.2em] text-white/60">01 / SOURCE</p>
              <p className="mt-3 text-[14px] leading-[1.95] text-white/70">
                メーカー公式資料・法令・整備書など、確認できる一次情報を優先して記事を構成します。
              </p>
            </div>
            <div>
              <p className="font-editorial text-[12px] font-bold tracking-[0.2em] text-white/60">02 / CLARITY</p>
              <p className="mt-3 text-[14px] leading-[1.95] text-white/70">
                初心者が迷わない順番で整理し、専門用語には必ずかみ砕いた説明を添えます。
              </p>
            </div>
            <div>
              <p className="font-editorial text-[12px] font-bold tracking-[0.2em] text-white/60">03 / HONESTY</p>
              <p className="mt-3 text-[14px] leading-[1.95] text-white/70">
                不確かなことは不確かと書く。費用やリスクも誇張せず、判断材料として提示します。
              </p>
            </div>
          </div>
          <Link
            href="/legal/editorial-policy"
            className="mt-10 inline-flex min-h-11 items-center rounded-full border border-white/25 px-6 text-[13px] font-medium tracking-[0.08em] text-white/85 transition-colors hover:bg-white/10 hover:text-white"
          >
            編集方針を読む ↗
          </Link>
        </div>
      </section>

      {/* CTA — 記事を探す導線 */}
      <section className="relative z-10 mx-auto w-full max-w-[1080px] px-[clamp(20px,5svw,44px)] py-[clamp(64px,10svh,104px)]">
        <div className="overflow-hidden rounded-[14px] bg-[linear-gradient(150deg,#0E7C7B,#0A5F5E)] p-[clamp(28px,6svw,56px)] text-white shadow-[0_1px_3px_rgba(31,35,40,0.05)]">
          <p className="font-editorial text-[11px] font-bold uppercase tracking-[0.32em] text-white/60">
            Start Reading
          </p>
          <h2 className="mt-4 max-w-[20ch] text-[clamp(24px,4.4svw,38px)] font-bold leading-[1.3]">
            いま知りたいことを、記事から探す。
          </h2>
          <p className="mt-4 max-w-[36rem] text-[14px] leading-[1.9] text-white/80">
            維持費、カスタム、故障の兆候、保険の選び方。テーマ別のガイドと、じっくり読めるコラムを用意しています。
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/guide"
              className="inline-flex min-h-11 items-center rounded-full bg-white px-6 text-[13px] font-bold tracking-[0.08em] text-[var(--teal-deep)] transition-colors hover:bg-white/90"
            >
              ガイドを見る
            </Link>
            <Link
              href="/column"
              className="inline-flex min-h-11 items-center rounded-full border border-white/40 px-6 text-[13px] font-bold tracking-[0.08em] text-white transition-colors hover:bg-white/10"
            >
              コラムを見る
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
