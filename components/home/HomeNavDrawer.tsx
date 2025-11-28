// components/home/HomeNavDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * ホーム上部の「NEWS / CARS / COLUMN / GUIDE」ナビカード。
 * 右上の丸いアイコンで開閉できるドロワーとして実装。
 *
 * 画面右上：トグルボタン
 * 画面下中央：開いたときだけ出てくるナビカード
 */
export default function HomeNavDrawer() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  // ルートが変わったら自動で閉じる
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* 右上のトグルボタン */}
      <button
        type="button"
        onClick={toggle}
        aria-label="メインメニューを開閉"
        aria-expanded={open}
        className="fixed right-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-soft backdrop-blur transition hover:-translate-y-[1px] hover:shadow-soft-strong sm:right-6 sm:top-6"
      >
        {/* 三本線アイコン（開いているときは × 風） */}
        <span className="relative block h-4 w-5">
          <span
            className={cn(
              "absolute left-0 h-[1.5px] w-full bg-slate-800 transition-transform duration-300",
              open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "absolute left-0 h-[1.5px] w-full bg-slate-800 transition-all duration-300",
              open
                ? "top-1/2 -translate-y-1/2 opacity-0"
                : "top-1/2 -translate-y-1/2 opacity-70",
            )}
          />
          <span
            className={cn(
              "absolute left-0 h-[1.5px] w-full bg-slate-800 transition-transform duration-300",
              open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0",
            )}
          />
        </span>
      </button>

      {/* 外側タップで閉じるためのオーバーレイ（少しだけ暗く） */}
      {open && (
        <button
          type="button"
          aria-hidden="true"
          onClick={close}
          className="fixed inset-0 z-[45] bg-black/10 backdrop-blur-[1px]"
        />
      )}

      {/* ナビゲーションカード本体（画面下からスライド） */}
      <div
        className={cn(
          "fixed inset-x-4 bottom-6 z-50 mx-auto max-w-xl transition-all duration-400 ease-out md:bottom-10",
          open
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-4 opacity-0 pointer-events-none",
        )}
      >
        <GlassCard
          padding="lg"
          className="w-full border border-white/80 bg-white/96 shadow-soft-strong"
        >
          <div className="space-y-6 text-slate-700">
            {/* ロゴ行 */}
            <div>
              <p className="serif-heading text-lg font-medium tracking-[0.16em] text-slate-900">
                CAR BOUTIQUE
              </p>
              <p className="mt-1 text-[10px] tracking-[0.32em] text-slate-400">
                NEWS ・ COLUMNS ・ DATABASE
              </p>
            </div>

            {/* メインタブ 4 本 */}
            <div className="space-y-4 text-[11px]">
              <Link
                href="/news"
                onClick={close}
                className="flex items-center justify-between rounded-2xl px-2 py-2.5 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.24em] text-slate-800">
                    NEWS
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    アップデート
                  </p>
                </div>
                <span className="text-slate-400">→</span>
              </Link>

              <Link
                href="/cars"
                onClick={close}
                className="flex items-center justify-between rounded-2xl px-2 py-2.5 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.24em] text-slate-800">
                    CARS
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    車種データベース
                  </p>
                </div>
                <span className="text-slate-400">→</span>
              </Link>

              <Link
                href="/column"
                onClick={close}
                className="flex items-center justify-between rounded-2xl px-2 py-2.5 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.24em] text-slate-800">
                    COLUMN
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    技術・メンテナンス
                  </p>
                </div>
                <span className="text-slate-400">→</span>
              </Link>

              <Link
                href="/guide"
                onClick={close}
                className="flex items-center justify-between rounded-2xl px-2 py-2.5 transition hover:bg-slate-50"
              >
                <div>
                  <p className="text-[12px] font-semibold tracking-[0.24em] text-slate-800">
                    GUIDE
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    お金と手放し方
                  </p>
                </div>
                <span className="text-slate-400">→</span>
              </Link>
            </div>

            {/* 下部 2 ボタン */}
            <div className="flex flex-col gap-2 pt-1 sm:flex-row">
              <Button
                asChild
                variant="primary"
                size="sm"
                fullWidth
                magnetic
                className="justify-center"
              >
                <Link href="/cars" onClick={close}>
                  車種一覧を開く
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                fullWidth
                magnetic
                className="justify-center"
              >
                <Link href="/guide" onClick={close}>
                  GUIDE を読む
                </Link>
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
