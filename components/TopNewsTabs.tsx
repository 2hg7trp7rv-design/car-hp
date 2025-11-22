"use client";

import { useState } from "react";
import Link from "next/link";
import type { NewsItem } from "@/lib/news";

type Props = {
  latest: NewsItem[];
  featured: NewsItem[];
};

function getTypeBadge(item: NewsItem) {
  const isOriginal = item.type === "original";

  if (isOriginal) {
    return {
      label: "ORIGINAL",
      className:
        "inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-600",
    };
  }

  return {
    label: item.sourceName ?? "EXTERNAL",
    className:
      "inline-flex items-center rounded-full border border-[#81d8d0] bg-[#81d8d0] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-900",
  };
}

export default function TopNewsTabs({ latest, featured }: Props) {
  const [tab, setTab] = useState<"latest" | "featured">("latest");

  const activeItems = tab === "latest" ? latest : featured;
  const isEmpty = activeItems.length === 0;

  return (
    <section className="mt-10 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 p-1 text-[11px]">
          <button
            type="button"
            onClick={() => setTab("latest")}
            className={`rounded-full px-3 py-1 transition ${
              tab === "latest"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            最新ニュース
          </button>
          <button
            type="button"
            onClick={() => setTab("featured")}
            className={`rounded-full px-3 py-1 transition ${
              tab === "featured"
                ? "bg-[#81d8d0] text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            注目ニュース
          </button>
        </div>

        <Link
          href="/news"
          className="hidden text-[11px] text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline sm:inline-block"
        >
          ニュース一覧へ →
        </Link>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-3 shadow-sm sm:p-4">
        {isEmpty ? (
          <p className="text-[12px] text-slate-500">
            まだこのタブに表示できるニュースがありません。
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {activeItems.slice(0, 3).map((item) => {
              const badge = getTypeBadge(item);

              return (
                <Link
                  key={item.id}
                  href={`/news/${encodeURIComponent(item.id)}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/90 p-3 text-[11px] shadow-sm transition hover:border-[#81d8d0] hover:shadow-md"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={badge.className}>{badge.label}</span>
                      {item.category && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-2 text-[12px] font-semibold text-slate-900">
                      {item.title}
                    </p>
                    {item.excerpt && (
                      <p className="line-clamp-3 text-[11px] leading-relaxed text-slate-600">
                        {item.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{item.sourceName ?? "CAR BOUTIQUE"}</span>
                    {item.publishedAt && (
                      <span>
                        {new Date(item.publishedAt).toLocaleDateString("ja-JP")}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="sm:hidden">
        <Link
          href="/news"
          className="text-[11px] text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
        >
          ニュース一覧へ →
        </Link>
      </div>
    </section>
  );
}
