// app/guide/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  getAllGuides,
  getGuideBySlug,
  type GuideArticle,
} from "@/lib/guides";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

export const runtime = "edge";

type PageProps = {
  params: { slug: string };
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export async function generateStaticParams() {
  const guides = await getAllGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    return {
      title: "ガイドが見つかりません | CAR BOUTIQUE",
      description: "指定されたガイドページが見つかりませんでした。",
    };
  }

  const title = `${guide.title} | CAR BOUTIQUE`;
  const description = guide.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `https://car-hp.vercel.app/guide/${encodeURIComponent(
        guide.slug,
      )}`,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const guide = await getGuideBySlug(params.slug);

  if (!guide) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        {/* パンくず */}
        <nav
          className="mb-6 text-xs text-slate-500"
          aria-label="パンくずリスト"
        >
          <Link href="/" className="hover:text-slate-800">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href="/guide" className="hover:text-slate-800">
            GUIDE
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-400 truncate align-middle">
            {guide.title}
          </span>
        </nav>

        {/* ヘッダー */}
        <header className="mb-10">
          <Reveal>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.26em] text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="h-[1px] w-6 bg-tiffany-400" />
                GUIDE
              </span>
              <span className="h-[1px] w-6 bg-slate-200" />
              <span>{guide.categoryLabel}</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {guide.title}
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                約 {guide.readMinutes} 分で読めます
              </span>
              <span className="h-[1px] w-6 bg-slate-200" />
              <span>最終更新 {formatDate(guide.updatedAt)}</span>
              {guide.relatedTags && guide.relatedTags.length > 0 && (
                <>
                  <span className="h-[1px] w-6 bg-slate-200" />
                  <div className="flex flex-wrap gap-1.5">
                    {guide.relatedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Reveal>

          <Reveal delay={220}>
            <p className="mt-5 max-w-2xl text-xs leading-relaxed text-text-sub sm:text-sm">
              {guide.description}
            </p>
          </Reveal>
        </header>

        {/* レイアウト：本文 + 目次（PC） */}
        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          {/* 本文 */}
          <section className="w-full lg:w-[70%]">
            {guide.sections.map((section, index) => {
              const paragraphs = section.body
                .split(/\n{2,}/)
                .map((p) => p.trim())
                .filter(Boolean);

              return (
                <Reveal
                  key={section.id}
                  delay={index === 0 ? 0 : 60}
                  className={index === 0 ? "" : "mt-10"}
                >
                  <article id={section.id}>
                    <h2 className="text-base font-semibold tracking-[0.08em] text-slate-900 sm:text-lg">
                      {section.title}
                    </h2>

                    <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700 sm:text-[15px]">
                      {paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}

                      {section.bullets && section.bullets.length > 0 && (
                        <ul className="mt-3 space-y-1.5 text-[13px] text-slate-700">
                          {section.bullets.map((b) => (
                            <li key={b} className="flex gap-2">
                              <span className="mt-[6px] h-[3px] w-5 rounded-full bg-tiffany-300" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}

            {/* 戻る導線（SPメイン） */}
            <div className="mt-14 border-t border-slate-100 pt-6">
              <Link
                href="/guide"
                className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] text-slate-500 hover:text-tiffany-600"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
                  ←
                </span>
                GUIDE 一覧に戻る
              </Link>
            </div>
          </section>

          {/* 目次（PCのみ） */}
          <aside className="hidden w-[30%] lg:block">
            <div className="sticky top-24 rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-[11px] text-slate-600 shadow-sm backdrop-blur">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                CONTENTS
              </p>
              <ul className="space-y-2">
                {guide.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block leading-relaxed hover:text-tiffany-600"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
