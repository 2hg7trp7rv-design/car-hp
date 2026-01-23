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
      // --------------------------------
      // カラー / 質感
      // --------------------------------
	      colors: {
	        // 共通ルール: 背景は白
	        background: "#FFFFFF",
	        // 共通ルール: 文字は濃いグレー（#222222）
	        "text-main": "#222222",
	        "text-sub": "#666666",

        // Tiffany系（アクセント）
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

        // 空気色・素材色
        vapor: "#F0FBFB", // Ice Vapor: 白と青の中間にある空気色
        ice: "#F0FBFB", // alias: ice カラーとしても使えるようにする
	        obsidian: "#222222", // 共通ルールに合わせて濃いグレーへ
        porcelain: "#FFFFFF", // 陶器のような白

        // Dim パレット（ガラスUIの背景など）
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
      

// Brand（Minimalist Grandeur）
brand: {
  white: "#FFFFFF",
  vapor: "#FFFFFF",
  blue: "#0ABAB5",
  black: "#222222",
  slate: "#666666",
  light: "#E5E5E5",
},
},

      // --------------------------------
      // グラデーション / 背景（仕様書: メッシュ系）
      // --------------------------------
      backgroundImage: {
        // 共通ルール: 背景は白（Tiffanyのメッシュ背景は撤去）
        "site-mesh": "none",
        site: "none",
        atmosphere: "none",

        // 互換: 既存コンポーネント向け（極薄の紙感に寄せる）
        "card-spot":
          "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.88))",

        // 互換: 旧キー（未使用なら影響なし）
        "hero-spot": "none",
        "obsidian-mesh": "none",

        "blue-gradient": "none",
},

      // --------------------------------
      // シャドウ（Glass / Boutique 用）
      // --------------------------------
      boxShadow: {
        // Glassmorphism用の内側発光
        "glass-inner": "inset 0 1px 0 0 rgba(255, 255, 255, 0.4)",
        // 浮遊感の強調
	        "soft-glow": "0 0 40px -10px rgba(34, 34, 34, 0.08)",

        // 既存影
        soft: "0 8px 30px rgba(0, 0, 0, 0.04)",
	        "soft-card": "0 20px 40px -10px rgba(34, 34, 34, 0.08)",
	        "soft-strong": "0 20px 50px -12px rgba(34, 34, 34, 0.16)",
	        glow: "0 0 20px rgba(34, 34, 34, 0.14)",

        // ガラスの厚みと内部反射
        "glass-edge":
	          "inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 2px 0 rgba(34, 34, 34, 0.08)",
        "glass-deep":
          "0 12px 40px -4px rgba(13, 38, 38, 0.15), inset 0 0 0 1px rgba(255,255,255,0.1)",
      },

      // --------------------------------
      // タイポグラフィ（フォントは next/font 経由で）
      // --------------------------------
      fontFamily: {
        sans: ["var(--font-montserrat)", "ui-sans-serif", "system-ui"],
        serif: ["var(--font-bodoni)", "serif"],
      },

      fontSize: {
        // 見出し系
        "display-1": ["3.25rem", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        "display-2": ["2.75rem", { lineHeight: "1.08", letterSpacing: "-0.03em" }],
        "title-1": ["2.125rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "title-2": ["1.5rem", { lineHeight: "1.18", letterSpacing: "-0.01em" }],

display: ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
h1: ["3.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
h2: ["2.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
h3: ["1.75rem", { lineHeight: "1.3", letterSpacing: "0em" }],
"body-lg": ["1.125rem", { lineHeight: "1.8", letterSpacing: "0.05em" }],
"body-base": ["1rem", { lineHeight: "1.7", letterSpacing: "0.05em" }],
caption: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0.2em" }],
tiny: ["0.75rem", { lineHeight: "1.5", letterSpacing: "0.2em" }],
},

      letterSpacing: {
        wider: "0.16em", // セクションラベル用

tighter: "-0.03em",
tight: "-0.01em",
wide: "0.05em",
widest: "0.2em",
},

      // --------------------------------
      // 余白スケール（セクション間のマクロスペース）
      // --------------------------------
      spacing: {
        // セクション縦方向の標準値（仕様書: 120–200px）
        "section-sm": "3.5rem", // ~56px
        section: "5rem", // ~80px
        "section-lg": "7.5rem", // ~120px
        "section-xl": "9.5rem", // ~152px
      },

      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },

      // --------------------------------
      // モーション / トランジション
      // --------------------------------
      transitionTimingFunction: {
        magnetic: "cubic-bezier(0.35, 0, 0.65, 1)",
        liquid: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
      transitionDuration: {
        fast: "150ms",
        normal: "250ms",
        slow: "400ms",

400: "400ms",
},
      animation: {
        "liquid-expand":
          "liquidExpand 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "fade-up-soft": "fadeUpSoft 0.6s ease-out forwards",
        "float-soft": "floatSoft 4s ease-in-out infinite",
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
        fadeUpSoft: {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        floatSoft: {
          "0%, 100%": {
            transform: "translate3d(0, 0, 0)",
          },
          "50%": {
            transform: "translate3d(0, -6px, 0)",
          },
        },
      },

      // --------------------------------
      // コンテナ（センタリング）
      // --------------------------------
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
          xl: "2rem",
          "2xl": "2.5rem",
        },
        screens: {
          sm: "640px",
          md: "768px",
          lg: "1024px",
          xl: "1280px",
          "2xl": "1400px",
        },
      },
    },
  },
  plugins: [],
};

export default config;
