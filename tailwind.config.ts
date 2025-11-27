// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      // シャドウ（Glass / Boutique 用）
      boxShadow: {
        // Glassmorphism用の内側発光
        "glass-inner": "inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
        // 浮遊感の強調
        "soft-glow": "0 0 40px -10px rgba(10, 186, 181, 0.15)",

        // 既存影
        soft: "0 8px 30px rgba(0, 0, 0, 0.04)",
        "soft-card": "0 20px 40px -10px rgba(10, 186, 181, 0.1)",
        "soft-strong": "0 20px 50px -12px rgba(10, 186, 181, 0.25)",
        glow: "0 0 20px rgba(10, 186, 181, 0.3)",

        // 【新規】ガラスの厚みと内部反射
        "glass-edge":
          "inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 2px 0 rgba(10, 186, 181, 0.1)",
        "glass-deep":
          "0 12px 40px -4px rgba(13, 38, 38, 0.15), inset 0 0 0 1px rgba(255,255,255,0.1)",
      },

      colors: {
        background: "#F8FAFC",
        // テキスト色：純粋な黒ではなく、わずかに青みを含ませて馴染ませる
        "text-main": "#0F172A",
        "text-sub": "#6B7280",

        // 既存のTiffany系（アクセント用）
        tiffany: {
          DEFAULT: "#0ABAB5",
          50: "#E5FAF8",
          100: "#C9F3EF",
          200: "#9FE6DF",
          300: "#6FD7CF",
          400: "#37C8C0",
          500: "#0ABAB5",
          600: "#089D99",
          700: "#077F7B",
        },

        // 【新規】空間色と素材色
        vapor: "#F0FBFB", // Ice Vapor: 白と青の中間にある空気色
        obsidian: "#1A1A1A", // 柔らかい黒
        porcelain: "#FFFFFF", // 陶器のような白

        // 【新規】Phase 2: Glassmorphism 用 Dim パレット
        "tiffany-dim": {
          50: "#F2FAFA",
          100: "#E6F4F4",
          200: "#CFE8E8",
          300: "#A8D1D1",
          400: "#82B8B8",
          500: "#5C9E9E",
          600: "#458282",
          700: "#2F6666",
          800: "#1A4242",
          900: "#0D2626",
        },
      },

      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },

      fontFamily: {
        // app/layout.tsx で定義するCSS変数と紐付け
        sans: ["var(--font-manrope)", "sans-serif"],
        serif: ["var(--font-bodoni)", "serif"],
      },

      // 物理感のあるイージング / アニメーション
      transitionTimingFunction: {
        magnetic: "cubic-bezier(0.35, 0, 0.65, 1)",
        liquid: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
      animation: {
        "liquid-expand":
          "liquidExpand 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards",
      },
      keyframes: {
        liquidExpand: {
          "0%": {
            transform: "translateY(100%) scale(2)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0%) scale(2)",
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [],
};

export default config;
