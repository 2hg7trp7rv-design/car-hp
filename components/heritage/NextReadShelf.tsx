"use client";

import React, { useEffect } from "react";
import Image from "next/image";

import { TrackedLink } from "@/components/analytics/TrackedLink";
import { useImpressionOnce } from "@/components/analytics/useImpressionOnce";
import {
  trackInternalNavImpression,
  type PageType,
} from "@/lib/analytics/events";
import { usePageContext } from "@/lib/analytics/pageContext";

type ShelfItem = {
  type: "CARS" | "GUIDE" | "COLUMN";
  title: string;
  slug: string;
  description: string;
  image?: string;
};

type NextReadShelfProps = {
  cars?: any[];
  guides?: any[];
  columns?: any[];

  /** analytics 用。未指定なら next_read_shelf */
  shelfId?: string;
};

function toHref(item: ShelfItem): string {
  switch (item.type) {
    case "CARS":
      return `/cars/${encodeURIComponent(item.slug)}`;
    case "GUIDE":
      return `/guide/${encodeURIComponent(item.slug)}`;
    case "COLUMN":
    default:
      return `/column/${encodeURIComponent(item.slug)}`;
  }
}

function toTrackedToType(item: ShelfItem): "cars" | "guide" | "column" {
  switch (item.type) {
    case "CARS":
      return "cars";
    case "GUIDE":
      return "guide";
    case "COLUMN":
    default:
      return "column";
  }
}

function normalizeCtxToPageType(pageType: string, contentId: string): PageType {
  const isIndex = contentId === "index" || contentId === "top";

  if (pageType === "top") return "home";
  if (pageType === "hub") return "guide_hub";

  if (pageType === "cars") return isIndex ? "cars_index" : "cars_detail";
  if (pageType === "heritage")
    return isIndex ? "heritage_index" : "heritage_detail";
  if (pageType === "column") return isIndex ? "column_index" : "column_detail";
  if (pageType === "guide") return isIndex ? "guide_index" : "guide_detail";
  if (pageType === "news") return isIndex ? "news_index" : "news_detail";

  // 既に v1.2 PageType が入っているケース
  if (
    [
      "home",
      "cars_index",
      "cars_detail",
      "guide_index",
      "guide_detail",
      "guide_hub",
      "column_index",
      "column_detail",
      "heritage_index",
      "heritage_detail",
      "news_index",
      "news_detail",
      "other",
    ].includes(pageType)
  ) {
    return pageType as PageType;
  }

  return "other";
}

export const NextReadShelf: React.FC<NextReadShelfProps> = ({
  cars = [],
  guides = [],
  columns = [],
  shelfId = "next_read_shelf",
}) => {
  const items: ShelfItem[] = [
    ...(Array.isArray(columns) ? columns : []).map((c: any) => ({
      type: "COLUMN" as const,
      title: (c?.titleJa ?? c?.title ?? c?.name ?? "").toString() || "COLUMN",
      slug: (c?.slug ?? "").toString(),
      description: (c?.excerpt ?? c?.description ?? "").toString(),
      image:
        c?.heroImage ??
        c?.image ??
        c?.thumbnail ??
        c?.coverImage ??
        undefined,
    })),
    ...(Array.isArray(cars) ? cars : []).map((c: any) => ({
      type: "CARS" as const,
      title: (c?.nameJa ?? c?.name ?? c?.title ?? "").toString() || "CARS",
      slug: (c?.slug ?? "").toString(),
      description: (c?.excerpt ?? c?.description ?? "").toString(),
      image:
        c?.heroImage ??
        c?.image ??
        c?.thumbnail ??
        c?.coverImage ??
        undefined,
    })),
    ...(Array.isArray(guides) ? guides : []).map((g: any) => ({
      type: "GUIDE" as const,
      title: (g?.titleJa ?? g?.title ?? g?.name ?? "").toString() || "GUIDE",
      slug: (g?.slug ?? "").toString(),
      description: (g?.excerpt ?? g?.description ?? "").toString(),
      image:
        g?.heroImage ??
        g?.image ??
        g?.thumbnail ??
        g?.coverImage ??
        undefined,
    })),
  ]
    .filter((x) => typeof x.slug === "string" && x.slug.length > 0)
    .slice(0, 9);

  // ダミー遷移になる棚は出さない
  if (items.length === 0) return null;

  const ctx = usePageContext() as any;
  const { ref, hasImpression } = useImpressionOnce({ threshold: 0.35 });

  useEffect(() => {
    if (!hasImpression) return;

    const ctxType = String(
      ctx?.page_type ?? ctx?.pageType ?? ctx?.type ?? "other",
    );
    const ctxId = String(
      ctx?.content_id ?? ctx?.contentId ?? ctx?.pageId ?? ctx?.id ?? "",
    );

    trackInternalNavImpression({
      page_type: normalizeCtxToPageType(ctxType, ctxId),
      content_id: ctxId,
      shelf_id: shelfId,
      variant: "next_read_shelf",
    });
  }, [hasImpression, ctx?.page_type, ctx?.content_id, shelfId]);

  return (
    <section className="border-t border-slate-200/70 py-16">
      <div className="container mx-auto px-4" ref={ref}>
        <h3 className="mb-8 flex items-center justify-center gap-4 text-center font-serif text-2xl text-slate-800">
          <span className="h-[1px] w-8 bg-slate-200"></span>
          Next Story
          <span className="h-[1px] w-8 bg-slate-200"></span>
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((item, idx) => (
            <TrackedLink
              key={`${item.type}:${item.slug}:${idx}`}
              href={toHref(item)}
              shelfId={shelfId}
              ctaId={`${item.type.toLowerCase()}_${idx + 1}`}
              toType={toTrackedToType(item)}
              toId={item.slug}
              className="group relative block aspect-[3/4] overflow-hidden rounded-lg border border-slate-200/80 bg-white/70 md:aspect-[4/5]"
            >
              {/* 背景画像 */}
              <div className="absolute inset-0 bg-slate-100">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    quality={72}
                    className="object-cover opacity-55 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-35"
                  />
                )}
              </div>

              {/* コンテンツ */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-white/95 via-white/70 to-transparent p-6">
                <span className="mb-2 text-xs font-bold tracking-widest text-tiffany-700">
                  {item.type}
                </span>
                <h4 className="mb-2 font-serif text-xl font-medium leading-tight text-slate-900 transition-colors group-hover:text-tiffany-700">
                  {item.title}
                </h4>
                <p className="line-clamp-2 text-sm text-slate-600">
                  {item.description}
                </p>

                <div className="mt-4 flex items-center text-xs text-slate-600 transition-colors group-hover:text-slate-800">
                  Read More <span className="ml-2">→</span>
                </div>
              </div>
            </TrackedLink>
          ))}
        </div>
      </div>
    </section>
  );
};
