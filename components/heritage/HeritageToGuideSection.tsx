import Link from "next/link";

import { GlassCard } from "@/components/GlassCard";
import { Reveal } from "@/components/animation/Reveal";

const IconArrowRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

type Props = {
  guides: {
    slug: string;
    title: string;
    summary?: string;
    category?: string;
  }[];
};

export function HeritageToGuideSection({ guides }: Props) {
  if (guides.length === 0) return null;

  return (
    <section className="py-12">
      <Reveal>
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[var(--accent-base)]">関連ガイド</p>
            <h2 className="cb-sans-heading mt-2 text-xl text-[var(--text-primary)]">
              このブランドと付き合うための実用ガイド
            </h2>
          </div>
          <Link
            href="/guide"
            className="text-[11px] font-medium text-[var(--text-tertiary)] transition-colors hover:text-[var(--accent-base)]"
          >
            ガイド一覧へ
          </Link>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2">
        {guides.map((guide, idx) => (
          <Reveal key={guide.slug} delay={idx * 100}>
            <Link href={`/guide/${guide.slug}`} className="group block h-full">
              <GlassCard
                interactive
                magnetic={false}
                className="flex h-full flex-col justify-between border border-[var(--border-default)] bg-[var(--surface-2)] p-5 text-[var(--text-primary)] transition-all duration-300 hover:border-[rgba(27,63,229,0.3)]"
              >
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full border border-[var(--border-default)] bg-[var(--surface-1)] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[var(--accent-base)]">
                      {guide.category || "ガイド"}
                    </span>
                  </div>
                  <h3 className="cb-sans-heading text-lg font-medium text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-base)]">
                    {guide.title}
                  </h3>
                  {guide.summary && (
                    <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-[var(--text-secondary)]">
                      {guide.summary}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex items-center justify-end text-[11px] font-bold tracking-widest text-[var(--accent-base)] group-hover:underline decoration-1 underline-offset-4">
                  ガイドを見る
                  <IconArrowRight className="ml-1 h-3 w-3" />
                </div>
              </GlassCard>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
