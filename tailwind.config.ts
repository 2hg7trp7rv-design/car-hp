import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F8FAFC",
        // ラグジュアリー・パレット定義 [1, 1]
        tiffany: {
          DEFAULT: "#0ABAB5", // ブランドカラー
          50: "#E5FAF8",
          100: "#C9F3EF",
          200: "#9FE6DF",
          300: "#6FD7CF",
          400: "#37C8C0",
          500: "#0ABAB5",
          600: "#089D99",
          700: "#077F7B",
          dim: "rgba(10, 186, 181, 0.15)", // 環境光用
        },
        // 空間色
        vapor: "#F0FBFB", // Ice Vapor: 白と青の中間
        obsidian: "#1A1A1A", // Obsidian: 柔らかい黒
        porcelain: "#FFFFFF", // Porcelain: 陶器のような白
      },
      boxShadow: {
        soft: "0 8px 30px rgba(0, 0, 0, 0.04)",
        "soft-card": "0 20px 40px -10px rgba(10, 186, 181, 0.1)", // 青みがかった影
        "soft-strong": "0 20px 50px -12px rgba(10, 186, 181, 0.25)",
        glow: "0 0 20px rgba(10, 186, 181, 0.3)", // 発光表現
      },
      fontFamily: {
        // app/layout.tsx で定義するCSS変数と紐付け [1, 2]
        sans: ["var(--font-manrope)", "sans-serif"],
        serif: ["var(--font-bodoni)", "serif"],
      },
      // 物理的な奥行きを作るためのカスタムイージング
      transitionTimingFunction: {
        'magnetic': 'cubic-bezier(0.35, 0, 0.65, 1)',
      }
    },
  },
  plugins:,
};

export default config;
