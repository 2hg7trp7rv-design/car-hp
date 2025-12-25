// components/content/ColumnReaderShell.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { ColumnItem } from "@/lib/columns";
import { parseBodyToBlocks } from "@/lib/content/blocks";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";

export function ColumnReaderShell({ item }: { item: ColumnItem }) {
  const { blocks, headings } = useMemo(() => parseBodyToBlocks(item.body ?? ""), [item.body]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!headings || headings.length === 0) return;

    const ids = headings.map((h) => h.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));

        if (visible.length > 0) setActiveId((visible[0].target as HTMLElement).id);
      },
      { rootMargin: "0px 0px -70% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div>
        <ContentBlocks variant="column" blocks={blocks} />

        <div className="mt-10 border-t border-slate-100 pt-6">
          <Link href="/column" className="text-[12px] text-text-sub hover:text-text-main">
            ← コラム一覧に戻る
          </Link>
        </div>
      </div>

      {headings.length > 0 && (
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <Reveal>
              <GlassCard className="p-5">
                <div className="text-[11px] tracking-[0.18em] text-text-sub">CONTENTS</div>
                <ol className="mt-3 space-y-2 text-[12px] leading-relaxed text-text-sub">
                  {headings.map((h) => {
                    const isActive = activeId === h.id;
                    return (
                      <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
                        <a
                          href={`#${h.id}`}
                          className={isActive ? "text-text-main" : "hover:text-text-main"}
                        >
                          {h.text}
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </GlassCard>
            </Reveal>
          </div>
        </aside>
      )}
    </div>
  );
}
