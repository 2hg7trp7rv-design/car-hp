// components/layout/SiteHeader.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";

/**
 * SiteHeader Component - Phase 5 Edition
 * Implements Glassmorphism 2.0 with scroll-aware adaptation
 */
export function SiteHeader() {
  const = useState(false);
  const pathname = usePathname();

  // スクロール検知ロジック
  // パフォーマンスへの影響を最小限にするため、passiveオプションを使用
  useEffect(() => {
    const handleScroll = () => {
      // 閾値を20pxに設定し、少しスクロールしただけで反応するようにする
      setIsScrolled(window.scrollY > 20);
    };
    
    // 初期チェック
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  },);

  return (
    <header
      className={`
        fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${
          isScrolled
           ? "border-b border-white/40 bg-white/70 shadow-[0_8px_32px_rgba(10,186,181,0.05)] backdrop-blur-xl py-2"
            : "border-b border-transparent bg-transparent py-5"
        }
      `}
    >
      {/* ガラスの厚みとハイライトを表現する追加レイヤー（スクロール時のみ有効） */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isScrolled? 'opacity-100' : 'opacity-0'}`}
        style={{
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)'
        }}
      />

      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* 左: ブランドロゴ (Jewel Gradient) */}
        <Link href="/" className="group flex items-center gap-3">
          {/* ロゴマーク: 宝石のようなグラデーションと光沢 */}
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-tiffany-300 to-tiffany-500 shadow-[0_4px_16px_rgba(10,186,181,0.3)] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:shadow-[0_8px_24px_rgba(10,186,181,0.4)]">
            <span className="serif-heading relative z-10 text-[11px] font-bold tracking-widest text-white">
              CB
            </span>
            {/* Gloss shine effect (光の反射) */}
            <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-white/40 blur-[4px]" />
            <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-gradient-to-tl from-tiffany-700/20 to-transparent" />
          </div>

          <div className="flex flex-col">
            <span className="serif-heading text-[14px] font-semibold tracking-[0.22em] text-slate-900 transition-colors duration-300 group-hover:text-tiffany-600">
              CAR BOUTIQUE
            </span>
            <span className="text-[9px] font-medium tracking-[0.3em] text-text-sub opacity-70 group-hover:opacity-100 transition-opacity">
              DIGITAL SALON
            </span>
          </div>
        </Link>

        {/* 中央: PCナビゲーション (Glass Pill Style) */}
        <nav className="hidden md:block">
            {/* スクロール時はカプセル状の背景を表示して視認性を高める */}
            <div className={`
                flex items-center gap-1 rounded-full px-2 py-1.5 transition-all duration-500
                ${
                    isScrolled
                   ? "border border-white/50 bg-white/40 backdrop-blur-md shadow-sm"
                    : "border-transparent bg-transparent"
                }
            `}>
                <NavLink href="/news" label="NEWS" current={pathname} />
                <NavLink href="/cars" label="CARS" current={pathname} />
                <NavLink href="/column" label="COLUMN" current={pathname} />
                <NavLink href="/guide" label="GUIDE" current={pathname} />
                <NavLink href="/heritage" label="HERITAGE" current={pathname} />
            </div>
        </nav>

        {/* 右: アクション & モバイルメニュー */}
        <div className="flex items-center gap-4">
            {/* PCのみ表示: 検索アイコン（機能は今後のフェーズで実装） */}
            <button 
                className="hidden h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-all duration-300 hover:bg-slate-100 hover:text-tiffany-600 sm:flex"
                aria-label="サイト内検索"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>

            {/* Mobile Menu Integration */}
            <div className="md:hidden">
                 <MobileMenu />
            </div>
        </div>
      </div>
    </header>
  );
}

/**
 * NavLink Component
 * ホバー時に「磁気」のようなふわりとした背景を表示する
 */
type NavLinkProps = {
  href: string;
  label: string;
  current: string;
};

function NavLink({ href, label, current }: NavLinkProps) {
  // パスが一致するか、またはその配下（例: /cars/bmw...）にいるか
  const isActive = current === href |

| current.startsWith(`${href}/`);
  
  return (
    <Link
      href={href}
      className={`
        relative rounded-full px-5 py-2 text-[10px] font-bold tracking-[0.16em] transition-all duration-300
        ${
            isActive
           ? "text-slate-900" 
            : "text-slate-500 hover:text-tiffany-700"
        }
      `}
    >
      {/* Active State Background (Glow) */}
      {isActive && (
        <span className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] animate-in fade-in zoom-in-95 duration-300" />
      )}
      
      {/* Hover State Background (Subtle) */}
      {!isActive && (
        <span className="absolute inset-0 -z-20 scale-90 rounded-full bg-slate-100/50 opacity-0 transition-all duration-300 hover:scale-100 hover:opacity-100" />
      )}
      
      {label}
    </Link>
  );
}
