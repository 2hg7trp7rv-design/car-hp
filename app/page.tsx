import { HomeMasterpiece } from '@/components/home/HomeMasterpiece';

import { getIndexCars } from '@/lib/cars';
import { getLatestColumns } from '@/lib/columns';
import { getLatestGuides } from '@/lib/guides';
import { getAllHeritage } from '@/lib/heritage';

function decadeOf(year: number): string {
  const d = Math.floor(year / 10) * 10;
  return `${d}s`;
}

function yearFromEraLabel(label?: string | null): number | null {
  if (!label) return null;
  // try to extract 4-digit year
  const m = label.match(/(19\d{2}|20\d{2})/);
  if (!m) return null;
  const y = Number(m[1]);
  return Number.isFinite(y) ? y : null;
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
    meta: [c.maker, c.releaseYear ? String(c.releaseYear) : null].filter(Boolean).join(' / '),
  }));

  const latestGuides = (guides || []).slice(0, 6).map((g) => ({
    href: `/guide/${g.slug}`,
    title: g.title || g.slug,
    meta: g.publishedAt ? String(g.publishedAt).slice(0, 10) : '',
  }));

  const latestColumns = (columns || []).slice(0, 6).map((c) => ({
    href: `/column/${c.slug}`,
    title: c.title || c.slug,
    meta: c.publishedAt ? String(c.publishedAt).slice(0, 10) : '',
  }));

  const latestHeritage = (heritage || []).slice(0, 6).map((h) => ({
    href: `/heritage/${h.slug}`,
    title: h.title || h.slug,
    meta: h.eraLabel || (h.publishedAt ? String(h.publishedAt).slice(0, 10) : ''),
  }));

  const grouped = new Map<string, { slug: string; title: string; eraLabel?: string | null; publishedAt?: string | null }[]>();

  for (const h of heritage || []) {
    const y =
      yearFromEraLabel(h.eraLabel) ??
      (h.publishedAt ? new Date(h.publishedAt).getFullYear() : null);

    if (!y) continue;

    const decade = decadeOf(y);
    const arr = grouped.get(decade) ?? [];
    arr.push({ slug: h.slug, title: h.title, eraLabel: h.eraLabel ?? null, publishedAt: h.publishedAt ?? null });
    grouped.set(decade, arr);
  }

  // Sort decades descending, and items by publishedAt desc where possible
  const timeline = Array.from(grouped.entries())
    .sort((a, b) => {
      const ay = Number(a[0].replace('s', ''));
      const by = Number(b[0].replace('s', ''));
      return by - ay;
    })
    .slice(0, 7)
    .map(([decade, items]) => ({
      decade,
      items: items.sort((a, b) => {
        const ad = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const bd = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return bd - ad;
      }),
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
