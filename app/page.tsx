import Link from "next/link";

import { ContentRowCard } from "@/components/content/ContentRowCard";
import { getLatestColumns } from "@/lib/columns";
import { getLatestGuides } from "@/lib/guides";
import { getAllHeritage, getHeritagePreviewText } from "@/lib/heritage";
import { getAllCars } from "@/lib/cars";

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

export default async function Home() {
  const [latestColumns, latestGuides, allHeritage, allCars] = await Promise.all([
    getLatestColumns(3),
    getLatestGuides(3),
    getAllHeritage(),
    getAllCars(),
  ]);

  const latestHeritage = allHeritage.slice(0, 3);
  const latestCars = allCars.slice(0, 3);

  return (
    <main className="bg-site text-text-main">
      {/* Hero */}
      <section
        aria-label="Hero"
        className="relative h-[100svh] min-h-[640px] w-full overflow-hidden"
      >
        {/* Responsive hero image (mobile / desktop) */}
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet="/images/hero-top-desktop.jpeg"
          />
          <img
            src="/images/hero-top-mobile.jpeg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="eager"
          />
        </picture>

        {/* うっすら白のベール（文字可読性用） */}
        <div className="absolute inset-0 bg-gradient-to-l from-white/70 via-white/25 to-transparent" />

        {/* 左上：サイトマーク */}
        <div className="absolute left-6 top-7 z-10">
          <Link href="/" className="block">
            <p className="serif-heading text-[20px] tracking-[0.14em] text-[#222222]">
              CAR BOUTIQUE
            </p>
            <p className="mt-2 text-[10px] tracking-[0.24em] text-[#222222]/70">
              Journal / Database / Guide
            </p>
          </Link>
        </div>

        {/* 右側：縦書きキャッチ */}
        <div className="absolute right-6 top-1/2 z-10 -translate-y-1/2">
          <p className="vertical-rl text-[12px] tracking-[0.38em] text-[#222222]/70">
            時代を超える価値を、整理する。
          </p>
        </div>

        {/* 下部：導入コピー */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="page-shell pb-14">
            <div className="max-w-xl">
              <p className="text-[10px] font-medium tracking-[0.28em] text-[#222222]/65">
                MINIMALIST GRANDEUR
              </p>
              <h1 className="serif-heading mt-4 text-[28px] leading-[1.2] tracking-tight text-[#222222] sm:text-[34px]">
                迷わないための
                <br />
                “実務”だけを。
              </h1>
              <p className="mt-5 text-[13px] leading-relaxed text-[#222222]/70">
                整備・相場・買い方・手放し方。
                余計な煽りを省き、判断に必要な情報だけを静かに積み上げる。
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <Link
                  href="/guide"
                  className="inline-flex items-center rounded-full border border-[#222222]/15 bg-white/85 px-4 py-2 text-[10px] font-semibold tracking-[0.22em] text-[#222222] shadow-soft transition hover:border-[#0ABAB5]/60"
                >
                  GUIDE
                </Link>
                <Link
                  href="/cars"
                  className="inline-flex items-center rounded-full border border-[#222222]/15 bg-white/85 px-4 py-2 text-[10px] font-semibold tracking-[0.22em] text-[#222222] shadow-soft transition hover:border-[#0ABAB5]/60"
                >
                  CAR DATABASE
                </Link>
                <Link
                  href="/column"
                  className="inline-flex items-center rounded-full border border-[#222222]/15 bg-white/85 px-4 py-2 text-[10px] font-semibold tracking-[0.22em] text-[#222222] shadow-soft transition hover:border-[#0ABAB5]/60"
                >
                  COLUMNS
                </Link>
              </div>
            </div>
          </div>

          {/* 仕切り線 */}
          <div className="h-px w-full bg-[#222222]/10" />
        </div>
      </section>

      {/* Latest (Column / Guide / Heritage / Cars) */}
      <section className="page-shell page-section">
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.28em] text-[#222222]/55">LATEST</p>
          <h2 className="serif-heading mt-2 text-[22px] tracking-tight text-[#222222]">
            最新の更新
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Columns */}
          <div className="rounded-3xl border border-[#222222]/10 bg-white p-6 shadow-soft">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[10px] tracking-[0.28em] text-[#222222]/55">COLUMN</p>
                <h3 className="serif-heading mt-2 text-[20px] tracking-tight text-[#222222]">
                  最新コラム
                </h3>
              </div>
              <Link
                href="/column"
                className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/60 hover:text-[#0ABAB5]"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {latestColumns.map((c) => (
                <ContentRowCard
                  key={c.slug}
                  href={`/column/${encodeURIComponent(c.slug)}`}
                  title={c.titleJa ?? c.title}
                  excerpt={c.summary ?? null}
                  imageSrc={c.heroImage ?? null}
                  badge={c.category ? String(c.category) : "COLUMN"}
                  badgeTone="light"
                  date={formatDate((c.publishedAt ?? c.updatedAt) ?? null) || null}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Guides */}
          <div className="rounded-3xl border border-[#222222]/10 bg-white p-6 shadow-soft">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[10px] tracking-[0.28em] text-[#222222]/55">GUIDE</p>
                <h3 className="serif-heading mt-2 text-[20px] tracking-tight text-[#222222]">
                  最新ガイド
                </h3>
              </div>
              <Link
                href="/guide"
                className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/60 hover:text-[#0ABAB5]"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {latestGuides.map((g) => (
                <ContentRowCard
                  key={g.slug}
                  href={`/guide/${encodeURIComponent(g.slug)}`}
                  title={g.title}
                  excerpt={g.summary ?? null}
                  imageSrc={g.heroImage ?? null}
                  badge={(g.tags ?? [])[0] ?? (g.category ? String(g.category) : "GUIDE")}
                  badgeTone="light"
                  date={formatDate((g.publishedAt ?? g.updatedAt) ?? null) || null}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Heritage */}
          <div className="rounded-3xl border border-[#222222]/10 bg-white p-6 shadow-soft">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[10px] tracking-[0.28em] text-[#222222]/55">HERITAGE</p>
                <h3 className="serif-heading mt-2 text-[20px] tracking-tight text-[#222222]">
                  最新HERITAGE
                </h3>
              </div>
              <Link
                href="/heritage"
                className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/60 hover:text-[#0ABAB5]"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {latestHeritage.map((h) => (
                <ContentRowCard
                  key={h.slug}
                  href={`/heritage/${encodeURIComponent(h.slug)}`}
                  title={h.titleJa ?? h.title}
                  excerpt={getHeritagePreviewText(h, { maxChars: 120 }) || null}
                  imageSrc={h.heroImage ?? null}
                  badge={(h.tags ?? [])[0] ?? "HERITAGE"}
                  badgeTone="light"
                  date={formatDate((h.publishedAt ?? h.updatedAt) ?? null) || null}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Cars */}
          <div className="rounded-3xl border border-[#222222]/10 bg-white p-6 shadow-soft">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[10px] tracking-[0.28em] text-[#222222]/55">CARS</p>
                <h3 className="serif-heading mt-2 text-[20px] tracking-tight text-[#222222]">
                  最新車種
                </h3>
              </div>
              <Link
                href="/cars"
                className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/60 hover:text-[#0ABAB5]"
              >
                VIEW ALL
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {latestCars.map((car) => (
                <ContentRowCard
                  key={car.slug}
                  href={`/cars/${encodeURIComponent(car.slug)}`}
                  title={car.titleJa ?? car.title}
                  excerpt={(car.summaryLong ?? car.summary) ?? null}
                  imageSrc={(car.heroImage ?? car.mainImage ?? null) as string | null}
                  badge={car.maker ? String(car.maker) : "CAR"}
                  badgeTone="light"
                  date={car.releaseYear ? String(car.releaseYear) : null}
                  size="sm"
                />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/compare"
                className="inline-flex items-center rounded-full border border-[#222222]/15 bg-white px-4 py-2 text-[10px] font-semibold tracking-[0.22em] text-[#222222] shadow-soft transition hover:border-[#0ABAB5]/60"
              >
                COMPARE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="page-shell page-section">
        <div className="rounded-3xl border border-[#222222]/10 bg-white px-6 py-10 shadow-soft">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] tracking-[0.28em] text-[#222222]/55">
                NEXT
              </p>
              <h3 className="serif-heading mt-2 text-[22px] tracking-tight text-[#222222]">
                まずはGUIDEから。
              </h3>
              <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-[#222222]/70">
                “何から始めればいいか分からない”状態を潰すために、結論→手順→次の一手の順で整理しています。
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/guide"
                className="inline-flex items-center rounded-full bg-[#222222] px-5 py-3 text-[10px] font-semibold tracking-[0.22em] text-white shadow-soft transition hover:opacity-90"
              >
                OPEN GUIDE
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center rounded-full border border-[#222222]/15 bg-white px-5 py-3 text-[10px] font-semibold tracking-[0.22em] text-[#222222] shadow-soft transition hover:border-[#0ABAB5]/60"
              >
                SEARCH
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
