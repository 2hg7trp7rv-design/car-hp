"use client";

import type { SyntheticEvent } from "react";
import { useCallback, useState } from "react";

type Props = {
  categoryLabel: string;
};

export function GuideOutline({ categoryLabel }: Props) {
  const [open, setOpen] = useState(false);

  const onToggle = useCallback((e: SyntheticEvent<HTMLDetailsElement>) => {
    setOpen((e.currentTarget as HTMLDetailsElement).open);
  }, []);

  return (
    <details
      className="mb-5 rounded-[20px] bg-[rgba(251,248,243,0.9)] px-4 py-3 text-xs text-[var(--text-secondary)]"
      onToggle={onToggle}
    >
      <summary className="cursor-pointer list-none select-none">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)]">
            このガイドの概要
          </p>
          <span className="text-[11px] text-[var(--text-tertiary)]">
            {open ? "とじる ▲" : "ひらく ▼"}
          </span>
        </div>
      </summary>

      <p className="mt-2 leading-relaxed">
        このガイドは「{categoryLabel}」の基本的な順番と判断軸を整理したものです。
        必要なところから順に確認。
      </p>
    </details>
  );
}
