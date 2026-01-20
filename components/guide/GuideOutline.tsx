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
      className="mb-5 rounded-2xl bg-slate-50/80 px-4 py-3 text-xs text-slate-700"
      onToggle={onToggle}
    >
      <summary className="cursor-pointer list-none select-none">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-slate-500">
            GUIDE OUTLINE
          </p>
          <span className="text-[11px] text-slate-400">
            {open ? "とじる ▲" : "ひらく ▼"}
          </span>
        </div>
      </summary>

      <p className="mt-2 leading-relaxed">
        このガイドは「{categoryLabel}」の基本の順番と判断軸を、迷わない形にまとめたものです。
        まず全体像を掴んでから、必要なところだけ深掘りしてください。
      </p>
    </details>
  );
}
