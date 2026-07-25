// app/fonts.ts
// CBJ site design v2 — サイト統一フォント
// Zen Maru Gothic（見出し700 / 本文400-500）+ Quicksand（数字・欧文500/700）
// next/font/google で読み込み、CSS変数 --font-zen / --font-quick を提供する。
// globals.css のフォントスタックはこれらの変数を最優先で参照する。

import { Zen_Maru_Gothic, Quicksand } from "next/font/google";

export const zenMaruGothic = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen",
  display: "swap",
});

export const quicksand = Quicksand({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-quick",
  display: "swap",
});

export const fontVariables = `${zenMaruGothic.variable} ${quicksand.variable}`;
