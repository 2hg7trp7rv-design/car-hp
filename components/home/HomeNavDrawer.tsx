// components/home/HomeNavDrawer.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItemKey = "cars" | "column" | "guide" | "heritage";

const NAV_ITEMS: {
  key: NavItemKey;
  href: string;
  label: string;
  subLabel: string;
}[] = [
  {
    key: "cars",
    href: "/cars",
    label: "CARS",
    subLabel: "車種データベース",
  },
  {
    key: "column",
    href: "/column",
    label: "COLUMN",
    subLabel: "トラブル・メンテナンス",
  },
  {
    key: "guide",
    href: "/guide",
    label: "GUIDE",
    subLabel: "お金と手放し方",
  },
  {
    key: "heritage",
    href: "/heritage",
    label: "HERITAGE",
    subLabel: "ブランドと歴史",
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  // /guide/slug などの詳細ページでもタブを光らせる
  return pathname.startsWith(`${href}/`);
}

/**
 * TOP専用ナビドロワー
 * 右上の丸ボタン→画面下にCARS/COLUMN/GUIDE/HERITAGEカードを展開
 * - スマホ前提の「どこから入ればいいか」を示すコンパス的な役割
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
      {/* 右上トグルボタン */}
      <button
        type="button"
        onClick={toggle}
        aria-label="メインメニューを開閉"
        aria-expanded={open}
        className="fixed right-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/90 shadow-soft backdrop-blur transition-transform duration-300 hover:-translate-y-[1px] hover:shadow-soft-strong sm:right-6 sm:top-6"
      >
        {/* 三本線アイコン（open時は×） */}
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

      {/* 外側タップで閉じるオーバーレイ */}
      {open && (
        <button
          type="button"
          aria-hidden="true"
          onClick={close}
          className="fixed inset-0 z-[45] bg-black/10 backdrop-blur-[1px]"
        />
      )}

      {/* ナビカード本体（画面下からスライド） */}
      <div
        className={cn(
          "fixed inset-x-4 bottom-6 z-50 mx-auto max-w-xl transition-all duration-300 ease-out md:bottom-10",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0",
        )}
        aria-hidden={!open}
      >
        <GlassCard
          padding="lg"
          className="w-full border border-white/80 bg-white/96 shadow-soft-strong"
        >
          <div className="space-y-6 text-slate-700">
            {/* ロゴ + 説明 */}
            <div>
              <p className="serif-heading text-lg font-medium tracking-[0.16em] text-slate-900">
                CAR BOUTIQUE
              </p>
              <p className="mt-1 text-[10px] tracking-[0.32em] text-slate-400">
                COLUMNS・GUIDE・CARS・HERITAGE
              </p>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
                どこから見始めれば良いか迷ったときに
                CARS/COLUMN/GUIDE/HERITAGEの入口だけまとめたナビです。
              </p>
            </div>

            {/* メインタブ群 */}
            <div className="space-y-1.5 text-[11px]">
              {NAV_ITEMS.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex items-center justify-between rounded-2xl px-2 py-2.5 transition-colors",
                      active
                        ? "bg-slate-900 text-slate-50"
                        : "hover:bg-slate-50",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <div>
                      <p
                        className={cn(
                          "text-[12px] font-semibold tracking-[0.24em]",
                          active ? "text-slate-50" : "text-slate-800",
                        )}
                      >
                        {item.label}
                      </p>
                      <p
                        className={cn(
                          "mt-0.5 text-[11px]",
                          active ? "text-slate-200" : "text-slate-400",
                        )}
                      >
                        {item.subLabel}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border text-[11px]",
                        active
                          ? "border-slate-500 bg-slate-800 text-slate-50"
                          : "border-slate-200 bg-slate-50 text-slate-400",
                      )}
                    >
                      →
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* 下部CTAボタン */}
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
                  とりあえず車種一覧を見る
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
                  お金と段取りのGUIDEを読む
                </Link>
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
