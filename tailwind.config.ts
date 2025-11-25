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
      colors: {
        background: "#F8FAFC",
        // テキスト
        "text-main": "#0F172A",
        "text-sub": "#6B7280",
        // Tiffany系
        tiffany: {
          50: "#E5FAF8",
          100: "#C9F3EF",
          200: "#9FE6DF",
          300: "#6FD7CF",
          400: "#37C8C0",
          500: "#0ABAB5",
          600: "#089D99",
          700: "#077F7B",
        },
        "brand-tiffanySoft": "#6BCAC4",
      },
      boxShadow: {
        // ごく薄い影
        soft: "0 8px 20px rgba(15, 23, 42, 0.08)",
        // カード用
        "soft-card": "0 18px 40px rgba(15, 23, 42, 0.12)",
        // 強め（ボタンなど）
        "soft-strong": "0 18px 40px rgba(10, 186, 181, 0.35)",
        "soft-stronger": "0 22px 50px rgba(10, 186, 181, 0.45)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      fontFamily: {
        // 実体はglobals.css側で読み込み
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
