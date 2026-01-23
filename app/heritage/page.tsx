import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";

import type { HeritageItem } from "@/lib/content-types";
import { getAllHeritage, getHeritagePreviewText } from "@/lib/heritage";

type PageProps = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

function toSingle(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0];
  return undefined;
}

function pickCoverImage(src: string | null | undefined): string {
  if (!src || src === "/ogp-default.jpg" || src === "/ogp-default.png") {
    return "/images/heritage/hero_default.jpg";
  }
  return src;
}

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[\s\u3000]+/g, " ")
    .trim();
}

function buildHref(params: {
  q: string;
  maker: string;
  era: string;
  tag: string;
  page: number;
}): string {
  const usp = new URLSearchParams();
  if (params.q) usp.set("q", params.q);
  if (params.maker) usp.set("maker", params.maker);
  if (params.era) usp.set("era", params.era);
  if (params.tag) usp.set("tag", params.tag);
  if (params.page && params.page > 1) usp.set("page", String(params.page));
  const qs = usp.toString();
  return qs ? `/heritage?${qs}` : "/heritage";
}

function collectTop(values: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const v of values) {
    const key = v.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
}

function ChipLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={active ? "primary-chip" : "secondary-chip"}
    >
      {label}
    </Link>
  );
}

function HeritageCoverCard({ item }: { item: HeritageItem }) {
  const cover = pickCoverImage(item.heroImage);
  const excerpt = getHeritagePreviewText(item, 150);

  const metaBits = [item.maker, item.eraLabel].filter(Boolean);

  return (
    <Link href={`/heritage/${item.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-3xl border border-[#222222]/10 shadow-soft">
        <div className="relative aspect-[16/10] sm:aspect-[21/10]">
          <Image
            src={cover}
            alt={item.heroCaption || item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, 900px"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/70" />
        </div>

        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] tracking-[0.2em] text-white/85">
                HERITAGE
              </span>
              {metaBits.length > 0 ? (
                <span className="text-[11px] tracking-[0.12em] text-white/70">
                  {metaBits.join(" • ")}
                </span>
              ) : null}
            </div>

            <h3 className="mt-4 serif-heading text-[22px] leading-[1.18] text-white sm:text-[30px]">
              {item.title}
            </h3>

            {excerpt ? (
              <p className="mt-2 max-w-[72ch] text-[13px] leading-relaxed text-white/80 line-clamp-2">
                {excerpt}
              </p>
            ) : null}

            <p className="mt-4 text-[12px] text-white/70">読む →</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const q = toSingle(searchParams?.q) ?? "";
  const maker = toSingle(searchParams?.maker) ?? "";
  const era = toSingle(searchParams?.era) ?? "";
  const tag = toSingle(searchParams?.tag) ?? "";

  const filtered = Boolean(q || maker || era || tag);

  return {
    title: "HERITAGE｜ブランドの系譜と名車の歴史  CAR BOUTIQUE",
    description:
      "ブランドの系譜、名車の系統、技術と文化の転換点を。写真と余白で“没入”させる読み物として編集します。",
    robots: filtered ? { index: false, follow: true } : { index: true, follow: true },
  };
}

export default async function HeritagePage({ searchParams }: PageProps) {
  const all = await getAllHeritage();

  const q = toSingle(searchParams?.q) ?? "";
  const maker = toSingle(searchParams?.maker) ?? "";
  const era = toSingle(searchParams?.era) ?? "";
  const tag = toSingle(searchParams?.tag) ?? "";
  const page = Math.max(1, parseInt(toSingle(searchParams?.page) ?? "1", 10) || 1);

  const qNorm = normalizeText(q);

  // --- Filter lists (reduced, “too much info”回避) ---
  const makerValues = collectTop(
    all
      .map((h) => h.maker)
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0),
    8,
  );

  const eraValues = collectTop(
    all
      .map((h) => h.eraLabel)
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0),
    8,
  );

  const tagValues = collectTop(
    all.flatMap((h) => (Array.isArray(h.tags) ? h.tags : [])).filter((v) => typeof v === "string"),
    10,
  );

  // --- Filtering ---
  let filtered = all;

  if (maker) {
    const m = normalizeText(maker);
    filtered = filtered.filter((h) => normalizeText(h.maker ?? "") === m);
  }

  if (era) {
    const e = normalizeText(era);
    filtered = filtered.filter((h) => normalizeText(h.eraLabel ?? "") === e);
  }

  if (tag) {
    filtered = filtered.filter((h) => (Array.isArray(h.tags) ? h.tags : []).includes(tag));
  }

  if (qNorm) {
    filtered = filtered.filter((h) => {
      const blob = normalizeText(
        [
          h.title,
          h.lead ?? "",
          h.summary ?? "",
          ...(Array.isArray(h.highlights) ? h.highlights : []),
          ...(Array.isArray(h.tags) ? h.tags : []),
        ].join(" "),
      );
      return blob.includes(qNorm);
    });
  }

  // --- Sort (newer first if dates exist) ---
  filtered = [...filtered].sort((a, b) => {
    const da = a.updatedAt || a.publishedAt || a.createdAt || "";
    const db = b.updatedAt || b.publishedAt || b.createdAt || "";
    return db.localeCompare(da);
  });

  const pageSize = 10;
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;
  const pageItems = filtered.slice(offset, offset + pageSize);

  const heroPick = pickCoverImage((pageItems[0] ?? all[0])?.heroImage);

  const hasFilters = Boolean(q || maker || era || tag);

  return (
    <div>
      <section className="relative min-h-[92vh] w-full overflow-hidden bg-[#0B0B0B]">
        <Image
          src={heroPick}
          alt="HERITAGE hero"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/70" />

        <div className="relative z-10">
          <div className="page-shell pt-10 sm:pt-14">
            <Breadcrumb
              tone="light"
              items={[
                { label: "HOME", href: "/" },
                { label: "HERITAGE" },
              ]}
              className="mb-10"
            />

            <div className="max-w-[780px] pb-16">
              <p className="text-[11px] tracking-[0.22em] text-white/70">HERITAGE</p>
              <h1 className="mt-5 serif-heading text-[34px] leading-[1.12] text-white sm:text-[46px]">
                ブランドの系譜と名車の歴史
              </h1>
              <p className="mt-5 text-[13.5px] leading-relaxed text-white/80">
                “知識”ではなく“体験”として読む。写真と余白、章ごとの雰囲気で、
                ブランドの転換点と名車の系統を没入型でまとめます。
              </p>

              <p className="mt-8 text-[12px] text-white/70">
                Scroll to explore ↓
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell -mt-12 relative z-10">
        <div className="rounded-3xl border border-[#222222]/10 bg-white/90 backdrop-blur shadow-soft p-6 sm:p-8">
          <form action="/heritage" method="get" className="grid gap-8">
            <div>
              <div className="text-[11px] tracking-[0.22em] text-[#222222]/60">SEARCH</div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="キーワードで探す（例：V10 / JDM / ハイブリッド）"
                  className="w-full rounded-full border border-[#222222]/10 bg-white px-5 py-3 text-[13px] text-[#222222]/80 shadow-soft focus:outline-none focus:ring-2 focus:ring-[#0ABAB5]/30"
                />

                {maker ? <input type="hidden" name="maker" value={maker} /> : null}
                {era ? <input type="hidden" name="era" value={era} /> : null}
                {tag ? <input type="hidden" name="tag" value={tag} /> : null}

                <button type="submit" className="primary-button w-full sm:w-auto">
                  Search
                </button>
              </div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.22em] text-[#222222]/60">MAKER</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ChipLink
                  href={buildHref({ q, maker: "", era, tag, page: 1 })}
                  label="ALL"
                  active={!maker}
                />
                {makerValues.map((m) => (
                  <ChipLink
                    key={m}
                    href={buildHref({ q, maker: m, era, tag, page: 1 })}
                    label={m}
                    active={maker === m}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] tracking-[0.22em] text-[#222222]/60">ERA</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ChipLink
                  href={buildHref({ q, maker, era: "", tag, page: 1 })}
                  label="ALL"
                  active={!era}
                />
                {eraValues.map((e) => (
                  <ChipLink
                    key={e}
                    href={buildHref({ q, maker, era: e, tag, page: 1 })}
                    label={e}
                    active={era === e}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] tracking-[0.22em] text-[#222222]/60">TAG</div>
                {hasFilters ? (
                  <Link
                    href="/heritage"
                    className="text-[12px] text-[#0ABAB5] underline underline-offset-4"
                  >
                    Clear filters
                  </Link>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <ChipLink
                  href={buildHref({ q, maker, era, tag: "", page: 1 })}
                  label="ALL"
                  active={!tag}
                />
                {tagValues.map((t) => (
                  <ChipLink
                    key={t}
                    href={buildHref({ q, maker, era, tag: t, page: 1 })}
                    label={t}
                    active={tag === t}
                  />
                ))}
              </div>
            </div>
          </form>
        </div>
      </section>

      <main className="page-shell pt-12 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-[12px] tracking-[0.18em] text-[#222222]/55">
            {total.toLocaleString()} STORIES
          </p>
          {totalPages > 1 ? (
            <p className="text-[12px] text-[#222222]/55">
              Page {safePage} / {totalPages}
            </p>
          ) : null}
        </div>

        <div className="mt-6 space-y-6">
          {pageItems.map((h) => (
            <HeritageCoverCard key={h.slug} item={h} />
          ))}
        </div>

        {totalPages > 1 ? (
          <div className="mt-10 flex items-center justify-between gap-3">
            {safePage > 1 ? (
              <Link
                href={buildHref({ q, maker, era, tag, page: safePage - 1 })}
                className="rounded-full border border-[#222222]/10 bg-white px-5 py-2 text-[12px] text-[#222222]/75 shadow-soft hover:bg-[#F7F8FA]"
              >
                ← Prev
              </Link>
            ) : (
              <span />
            )}

            {safePage < totalPages ? (
              <Link
                href={buildHref({ q, maker, era, tag, page: safePage + 1 })}
                className="rounded-full border border-[#222222]/10 bg-white px-5 py-2 text-[12px] text-[#222222]/75 shadow-soft hover:bg-[#F7F8FA]"
              >
                Next →
              </Link>
            ) : (
              <span />
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}
