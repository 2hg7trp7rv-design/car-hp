import Link from "next/link";

import { Breadcrumb } from "@/components/layout/Breadcrumb";

type HeritageRow = {
  slug: string;
  title: string;
  eraLabel?: string | null;
  publishedAt?: string | null;
};

type DecadeGroup = {
  decade: string;
  items: HeritageRow[];
};

type Props = {
  timeline: DecadeGroup[];
};

const ERA_CHIPS = ["2020s", "2010s", "2000s", "1990s", "1980s", "1970s", "1960s"] as const;

const DECADE_INTRO: Record<string, string> = {
  "2020s": "電動化とソフトウェアが主戦場になり、クルマの定義そのものが問い直された時代。",
  "2010s": "高性能化と安全技術が同時に進み、ブランドごとの思想差が見えやすくなった時代。",
  "2000s": "アナログ性能の到達点と、デジタル化への転換が同時に起きた時代。",
  "1990s": "日本車が世界的な記号になり、性能と文化が密接に結び付いた時代。",
  "1980s": "電子制御とブランドイメージが強く結び付き始めた時代。",
  "1970s": "オイルショックを経て、クルマの思想が問い直された時代。",
  "1960s": "高性能化の原点が形になり始めた時代。",
  UNFILED: "年代で括り切れない記事を置いています。",
};

function getAnchor(decade: string) {
  return `decade-${decade}`;
}

export function HeritageTimeArchive({ timeline }: Props) {
  const activeGroups = timeline.filter((group) => group.items.length > 0);
  const leadGroup = activeGroups[0] ?? null;
  const leadStory = leadGroup?.items[0] ?? null;

  return (
    <div className="min-h-screen bg-[var(--bg-stage)] text-[var(--text-primary)]">
      <section className="relative overflow-hidden border-b border-[var(--border-default)] bg-[linear-gradient(135deg,rgba(251,248,243,0.98)_0%,rgba(238,231,222,0.92)_55%,rgba(246,242,235,1)_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(27,63,229,0.16),transparent_34%)]" />
        <div className="page-shell relative z-10 pb-14 pt-28">
          <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "系譜" }]} />
          <div className="mt-7 max-w-3xl">
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--accent-base)]">系譜</p>
            <h1
              className="mt-4 text-[40px] font-semibold leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)] lg:text-[56px]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              クルマの転換点を、年代とテーマからたどる。
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--text-secondary)]">
              年代の流れをざっと見渡しながら、まず読むべき1本と、その前後にある記事を置いています。
            </p>
          </div>
        </div>
      </section>

      <div className="page-shell py-14 lg:py-16">
        {leadStory ? (
          <section className="mb-14 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Link
              href={`/heritage/${leadStory.slug}`}
              className="group relative overflow-hidden rounded-[22px] border border-[var(--border-default)] bg-[var(--surface-1)] p-8 transition-all duration-180 hover:border-[rgba(27,63,229,0.3)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(143,167,176,0.18),transparent_40%)]" />
              <div className="relative flex min-h-[260px] flex-col justify-end">
                <p className="text-[10px] font-semibold tracking-[0.20em] text-[var(--accent-base)]">注目記事</p>
                <h2
                  className="mt-4 text-[24px] font-semibold leading-[1.35] text-[var(--text-primary)] group-hover:text-[var(--accent-base)] lg:text-[28px]"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {leadStory.title}
                </h2>
                {leadStory.eraLabel ? (
                  <p className="mt-3 text-[12px] leading-relaxed text-[var(--text-secondary)]">{leadStory.eraLabel}</p>
                ) : null}
              </div>
            </Link>

            <div className="rounded-[22px] border border-[var(--border-default)] bg-[var(--surface-1)] p-6">
              <p className="text-[10px] font-semibold tracking-[0.20em] text-[var(--accent-base)]">年代から探す</p>
              <p className="mt-4 text-[13px] leading-relaxed text-[var(--text-secondary)]">
                系譜は、車種単体のスペックでは見えない「なぜ生まれたか」「何を変えたか」をたどるための棚です。
                まず1本読んで全体像を掴み、その後に関連する記事を追う流れを想定しています。
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {ERA_CHIPS.filter((era) => activeGroups.some((group) => group.decade === era)).map((era) => (
                  <a
                    key={era}
                    href={`#${getAnchor(era)}`}
                    className="rounded-full border border-[var(--border-default)] bg-[var(--surface-2)] px-4 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-[var(--text-secondary)] transition-colors duration-150 hover:border-[rgba(27,63,229,0.3)] hover:text-[var(--text-primary)]"
                  >
                    {era}
                  </a>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <div className="space-y-16">
          {activeGroups.map((group) => {
            const intro = DECADE_INTRO[group.decade] ?? "この年代の転換点をたどる。";
            const lead = group.items[0];
            const others = group.items.slice(1, 5);

            return (
              <section
                key={group.decade}
                id={getAnchor(group.decade)}
                className="border-t border-[var(--border-default)] pt-12 first:border-t-0 first:pt-0"
                aria-label={`${group.decade} の記事`}
              >
                <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.24em] text-[var(--accent-base)]">{group.decade === "UNFILED" ? "関連する読みもの" : group.decade}</p>
                    <h2
                      className="mt-2 text-[28px] font-semibold leading-[1.2] text-[var(--text-primary)]"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {group.decade === "UNFILED" ? "関連テーマ" : `${group.decade} の転換点`}
                    </h2>
                  </div>
                  <p className="max-w-xl text-[13px] leading-relaxed text-[var(--text-secondary)]">{intro}</p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr_0.85fr]">
                  {lead ? (
                    <Link
                      href={`/heritage/${lead.slug}`}
                      className="group flex min-h-[220px] flex-col justify-end rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-1)] p-6 transition-all duration-180 hover:border-[rgba(27,63,229,0.3)] lg:row-span-2 lg:min-h-[310px]"
                    >
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--accent-base)]">注目記事</p>
                      <h3
                        className="mt-4 text-[18px] font-semibold leading-[1.4] text-[var(--text-primary)] group-hover:text-[var(--accent-base)] lg:text-[22px]"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {lead.title}
                      </h3>
                      {lead.eraLabel ? <p className="mt-3 text-[11px] text-[var(--text-tertiary)]">{lead.eraLabel}</p> : null}
                    </Link>
                  ) : null}

                  {others.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/heritage/${item.slug}`}
                      className="group flex flex-col justify-between rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-1)] p-5 transition-all duration-180 hover:-translate-y-[1px] hover:border-[rgba(27,63,229,0.3)]"
                    >
                      <div>
                        <p className="text-[10px] font-semibold tracking-[0.16em] text-[var(--text-tertiary)]">関連する記事</p>
                        <h3 className="mt-3 text-[15px] font-semibold leading-[1.5] text-[var(--text-primary)] group-hover:text-[var(--accent-base)] line-clamp-3">{item.title}</h3>
                      </div>
                      {item.eraLabel ? <p className="mt-4 text-[11px] text-[var(--text-tertiary)]">{item.eraLabel}</p> : null}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          {activeGroups.length === 0 ? (
            <div className="py-24 text-center text-[var(--text-tertiary)]">
              <p className="text-[14px]">まもなく公開。</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default HeritageTimeArchive;
