"use client";

import { GlassCard } from "@/components/GlassCard";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { Reveal } from "@/components/animation/Reveal";
import { usePageContext } from "@/lib/analytics/pageContext";
import type { GuideItem } from "@/lib/guides";

type Props = {
  guides: GuideItem[];
  fromIdOverride?: string; // hub slug を明示したい場合
};

export function HubRelatedGuidesGrid({ guides, fromIdOverride }: Props) {
  const { page_type, content_id } = usePageContext();
  const from_type = page_type;
  const from_id = fromIdOverride ?? content_id;

  if (!guides || guides.length === 0) {
    return (
      <GlassCard className="border border-white/10 bg-white/5 p-6" padding="none">
        <p className="text-[11px] text-slate-500">関連GUIDEは準備中です。</p>
      </GlassCard>
    );
  }

  return (
    <Reveal>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <TrackedLink
            key={g.slug}
            href={`/guide/${encodeURIComponent(g.slug)}`}
                      
            fromType="hub"
            fromId={typeof from_id === "string" ? from_id : ""}
            toType="guide"
            toId={g.slug}
            shelfId="hub_related_guides"
          >
            <GlassCard className="group h-full border border-white/10 bg-white/5 p-5 transition hover:border-white/20 hover:bg-white/10">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500">
                GUIDE
              </p>
              <h3 className="mt-2 text-[13px] font-semibold leading-snug text-slate-100">
                {g.title}
              </h3>
              {g.summary && (
                <p className="mt-2 text-[11px] leading-relaxed text-slate-400 line-clamp-3">
                  {g.summary}
                </p>
              )}
            </GlassCard>
          </TrackedLink>
        ))}
      </div>
    </Reveal>
  );
}
