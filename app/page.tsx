import { HomeMasterpiece } from "@/components/home/HomeMasterpiece";

import { getIndexCars } from "@/lib/cars";
import { getLatestColumns } from "@/lib/columns";
import { getLatestGuides } from "@/lib/guides";
import { getAllHeritage } from "@/lib/heritage";

function decadeOf(year: number): string {
  const d = Math.floor(year / 10) * 10;
  return `${d}s`;
}

function yearFromEraLabel(label?: string | null): number | null {
  const s = (label ?? "").trim();
  if (!s) return null;

  // 4-digit year
  const m4 = s.match(/(19\d{2}|20\d{2})/);
  if (m4) return Number(m4[1]);

  // 1980s / 2000s / 2010s / 1980年代 など
  const md = s.match(/(19\d0|20\d0)\s*(?:s|年代)/i);
  if (md) return Number(md[1]);

  // 80s / 00s / 10s / 80年代 など（2桁年）
  const m2 = s.match(/(?:^|[^0-9])(\d{2})\s*(?:s|年代)/i);
  if (m2) {
    const two = Number(m2[1]);
    if (!Number.isFinite(two)) return null;
    const base = two <= 29 ? 2000 : 1900;
    return base + two;
  }

  return null;
}

function safeIsoDate(value?: string | null): string {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export default async function Page() {
  const [cars, guides, columns, heritage] = await Promise.all([
    getIndexCars(),
    getLatestGuides(6),
    getLatestColumns(6),
    getAllHeritage(),
  ]);

  const latestCars = (cars || []).slice(0, 6).map((c) => ({
    href: `/cars/${c.slug}`,
    title: c.name || c.title || c.slug,
    meta: [c.maker, c.releaseYear ? String(c.releaseYear) : null].filter(Boolean).join(" / "),
  }));

  const latestGuides = (guides || []).slice(0, 6).map((g) => ({
    href: `/guide/${g.slug}`,
    title: g.title || g.slug,
    meta: safeIsoDate(g.publishedAt ?? g.updatedAt),
  }));

  const latestColumns = (columns || []).slice(0, 6).map((c) => ({
    href: `/column/${c.slug}`,
    title: c.title || c.slug,
    meta: safeIsoDate(c.publishedAt ?? c.updatedAt),
  }));

  const latestHeritage = (heritage || []).slice(0, 6).map((h) => ({
    href: `/heritage/${h.slug}`,
    title: h.title || h.slug,
    meta: h.eraLabel || safeIsoDate(h.publishedAt ?? h.updatedAt),
  }));

  const grouped = new Map<
    string,
    { slug: string; title: string; eraLabel?: string | null; publishedAt?: string | null }[]
  >();

  for (const h of heritage || []) {
    const y =
      yearFromEraLabel(h.eraLabel) ??
      (h.publishedAt ? new Date(h.publishedAt).getFullYear() : null) ??
      (h.createdAt ? new Date(h.createdAt).getFullYear() : null);

    if (!y || !Number.isFinite(y)) continue;

    const decade = decadeOf(y);
    const arr = grouped.get(decade) ?? [];
    arr.push({
      slug: h.slug,
      title: h.title,
      eraLabel: h.eraLabel ?? null,
      publishedAt: h.publishedAt ?? null,
    });
    grouped.set(decade, arr);
  }

  const timeline = Array.from(grouped.entries())
    .sort((a, b) => Number(b[0].replace("s", "")) - Number(a[0].replace("s", "")))
    .slice(0, 7)
    .map(([decade, items]) => ({
      decade,
      items: items
        .sort((a, b) => {
          const ad = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
          const bd = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
          return bd - ad;
        })
        .slice(0, 6)
        .map((i) => ({
          slug: i.slug,
          title: i.title,
          eraLabel: i.eraLabel ?? null,
          publishedAt: i.publishedAt ? safeIsoDate(i.publishedAt) : null,
        })),
    }));

  return (
    <HomeMasterpiece
      timeline={timeline}
      latestCars={latestCars}
      latestHeritage={latestHeritage}
      latestGuides={latestGuides}
      latestColumns={latestColumns}
    />
  );
}
