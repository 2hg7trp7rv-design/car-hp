"use client";

import type { ReactNode } from "react";

import { GlassCard } from "@/components/GlassCard";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Reveal } from "@/components/animation/Reveal";
import { usePageContext } from "@/lib/analytics/pageContext";
import type { GuideItem } from "@/lib/guides";

type Props = {
  /** セクション見出し。省略時は非表示 */
  title?: string;
  guides: GuideItem[];

  /** 互換用：hub slug を明示したい場合 */
  fromIdOverride?: string;

  /** 新規：上位から明示したい場合（HubNextReadShelf と合わせる） */
  pageType?: string;
  contentId?: string;

  /** トラッキング用の棚ID（省略時は既定値） */
  shelfId?: string;

  /** 補足文 merge */
  note?: ReactNode;
};

export function HubRelatedGuidesGrid(props: Props) {
  const { title, guides, fromIdOverride, pageType, contentId, shelfId, note } = props;

  const { page_type, content_id } = usePageContext();
  const from_type = pageType ?? page_type;
  const from_id = contentId ?? fromIdOverride ?? content_id;
  const resolved_shelf_id = shelfId ?? "hub_related_guides";

  if (!guides || guides.length === 0) {
    return (
      <GlassCard className="border border-white/10 bg-white/5 p-6" padding="none">
        {title && (
          <p className="mb-2 text-[12px] font-semibold tracking-wide text-slate-300">
            {title}
          </p>
        )}
        <p className="text-[11px] text-slate-500">関連GUIDEは準備中です。</p>
        {note && <div className="mt-3 text-[11px] text-slate-500">{note}</div>}
      </GlassCard>
    );
  }

  return (
    <Reveal>
      <div>
        {title && (
          <div className="mb-4">
            <p className="text-[12px] font-semibold tracking-wide text-slate-200">{title}</p>
            {note && <div className="mt-2 text-[11px] text-slate-500">{note}</div>}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((g) => (
            <TrackedLink
              key={g.slug}
              href={`/guide/${encodeURIComponent(g.slug)}`}
              fromType={typeof from_type === "string" ? from_type : "hub"}
              fromId={typeof from_id === "string" ? from_id : ""}
              toType="guide"
              toId={g.slug}
              shelfId={resolved_shelf_id}
            >
              <GlassCard className="group h-full border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/10">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                  GUIDE
                </p>
                <h3 className="mt-2 text-[13px] font-semibold leading-snug text-slate-100">
                  {g.title}
                </h3>
                {g.summary && (
                  <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-slate-400">
                    {g.summary}
                  </p>
                )}
              </GlassCard>
            </TrackedLink>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
