// components/home/HomePrimaryNavPanel.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/GlassCard";

export function HomePrimaryNavPanel() {
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((v) => !v);

  return (
    <div className="relative">
      {/* 右上のトグルボタン */}
      <button
        type="button"
        onClick={toggle}
        aria-label="メインメニューを開閉"
        aria-expanded={open}
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-soft backdrop-blur md:static md:ml-auto"
      >
        {/* 三本線アイコン（open 時は × っぽく） */}
        <span className="relative block h-4 w-5">
          <span
            className={cn(
              "absolute left-0 h-[1.5px] w-full bg-slate-700 transition-transform duration-300",
              open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "absolute left-0 h-[1.5px] w-full bg-slate-700 transition-all duration-300",
              open ? "top-1/2 -translate-y-1/2 opacity-0" : "top-1/2 -translate-y-1/2 opacity-70",
            )}
          />
          <span
            className={cn(
              "absolute left-0 h-[1.5px] w-full bg-slate-700 transition-transform duration-300",
              open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0",
            )}
          />
        </span>
      </button>

      {/* パネル本体：スマホではトグル、md 以上では常時表示 */}
      <div
        className={cn(
          // ベース位置
          "fixed inset-x-3 top-16 z-40 md:static md:mt-6",
          // アニメーション
          "transition-all duration-500 ease-out",
          // 開閉状態（モバイル）
          open
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-3 opacity-0 pointer-events-none",
          // PC では常に表示
          "md:translate-y-0 md:opacity-100 md:pointer-events-auto",
        )}
      >
        {/* ここに今の NEWS/CARS/COLUMN/GUIDE の大きなカードそのまま入れる */}
        <GlassCard
          padding="lg"
          className="w-full border border-white/70 bg-white/92 shadow-soft-strong"
        >
          {/* ここから ↓ 既存のタブ内容を丸ごとコピペ */}
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.28em] text-slate-500">
                CAR BOUTIQUE
              </p>
              <p className="mt-1 text-[10px] tracking-[0.22em] text-slate-400">
                NEWS・COLUMNS・DATABASE
              </p>
            </div>

            <div className="space-y-4 text-sm">
              {/* NEWS */}
              <a
                href="/news"
                className="flex items-center justify-between rounded-2xl px-3 py-2 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.24em] text-slate-800">
                    NEWS
                  </p>
                  <p className="text-[11px] text-slate-400">アップデート</p>
                </div>
                <span className="text-slate-400">→</span>
              </a>

              {/* CARS */}
              <a
                href="/cars"
                className="flex items-center justify-between rounded-2xl px-3 py-2 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.24em] text-slate-800">
                    CARS
                  </p>
                  <p className="text-[11px] text-slate-400">
                    車種データベース
                  </p>
                </div>
                <span className="text-slate-400">→</span>
              </a>

              {/* COLUMN */}
              <a
                href="/column"
                className="flex items-center justify-between rounded-2xl px-3 py-2 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.24em] text-slate-800">
                    COLUMN
                  </p>
                  <p className="text-[11px] text-slate-400">
                    技術・メンテナンス
                  </p>
                </div>
                <span className="text-slate-400">→</span>
              </a>

              {/* GUIDE */}
              <a
                href="/guide"
                className="flex items-center justify-between rounded-2xl px-3 py-2 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.24em] text-slate-800">
                    GUIDE
                  </p>
                  <p className="text-[11px] text-slate-400">
                    お金と手放し方
                  </p>
                </div>
                <span className="text-slate-400">→</span>
              </a>
            </div>

            {/* 下の２ボタンもここに配置（車種一覧 / GUIDE を読む） */}
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-between">
              <a
                href="/cars"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2 text-[11px] font-semibold tracking-[0.18em] text-white shadow-soft"
              >
                車種一覧を開く
              </a>
              <a
                href="/guide"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-[11px] font-semibold tracking-[0.18em] text-slate-700 shadow-soft"
              >
                GUIDE を読む
              </a>
            </div>
          </div>
          {/* 既存の中身ここまで ↑ */}
        </GlassCard>
      </div>
    </div>
  );
}
