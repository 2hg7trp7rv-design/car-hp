// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        stage: "#11110F",
        "surface-1": "#181714",
        "surface-2": "#211E1A",
        "surface-3": "#2A2621",
        "border-default": "#39342D",
        "text-primary": "#F4EFE7",
        "text-secondary": "#B7AEA1",
        "text-tertiary": "#8E867B",
        accent: { DEFAULT: "#8FA7B0", strong: "#BCD1D8", subtle: "rgba(143,167,176,0.12)" },
        success: "#7FA18B",
        warning: "#F0A030",
        danger: "#B56E6A",
        error: "#E05555",
        offwhite: "#F7F9FA",
        background: "#11110F",
        "text-main": "#F4EFE7",
        "text-sub": "#B7AEA1",
        obsidian: "#11110F",
        porcelain: "#181714",
        vapor: "#211E1A",
        ice: "#211E1A",
        kinto: { tiffany: "#81D8D0", light: "#E8F8F6", dark: "#5BC4BB", error: "#E05555", warning: "#F0A030", offwhite: "#F7F9FA", black: "#0A0A0A" },
        tiffany: { DEFAULT: "#8FA7B0", 50: "#EEF3F5", 100: "#D6E4E8", 200: "#B8CDD4", 300: "#97B5BE", 400: "#8FA7B0", 500: "#8FA7B0", 600: "#6E8D98", 700: "#527580" },
        "tiffany-dim": { 50: "#1C1F20", 100: "#222729", 200: "#2B3235", 300: "#3A4347", 400: "#4D5A5F", 500: "#637074", 600: "#7D8C90", 700: "#96A7AB", 800: "#B2C0C4", 900: "#CDD7D9" },
        brand: { white: "#F4EFE7", vapor: "#211E1A", blue: "#8FA7B0", black: "#11110F", slate: "#8E867B", light: "#39342D" },
        "lesson-cream": "#FFF8F0",
        "lesson-juna": "#FF4081",
        "lesson-rina": "#26A69A",
        "lesson-primary": "#2D2D2D",
        "lesson-secondary": "#6B6B6B",
        "lesson-light": "#9E9E9E",
        "lesson-orange": "#FF8C42",
        "lesson-green": "#8BC34A",
        "lesson-pink": "#F06292",
        "lesson-blue": "#42A5F5",
        "lesson-yellow": "#FFCA28",
        "lesson-gold": "#FFD54F",
        "lesson-red": "#EF5350",
        "lesson-tip": "#66BB6A",
        "lesson-purple": "#AB47BC",
        "lesson-border": "#E8DDD0"
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-jp)", "var(--font-inter)", "Noto Sans JP", "Hiragino Sans", "Yu Gothic", "system-ui", "sans-serif"],
        serif: ["var(--font-noto-serif-jp)", "Hiragino Mincho ProN", "Yu Mincho", "ui-serif", "serif"],
        editorial: ["var(--font-cormorant)", "Georgia", "ui-serif", "serif"],
        mono: ["var(--font-geist-mono)", "SF Mono", "monospace"],
        quicksand: ["Quicksand", "sans-serif"]
      },
      spacing: { "4.5": "18px", "13": "52px", "15": "60px", "18": "72px", "22": "88px", "26": "104px" },
      borderRadius: { btn: "14px", card: "20px", hero: "28px", pill: "9999px" },
      transitionTimingFunction: { cbj: "cubic-bezier(0.2, 0, 0, 1)" },
      transitionDuration: { "120": "120ms", "180": "180ms", "240": "240ms" },
      boxShadow: {
        soft: "0 4px 16px rgba(0,0,0,0.28)",
        card: "0 8px 24px rgba(0,0,0,0.32)",
        strong: "0 16px 40px rgba(0,0,0,0.44)",
        "soft-glow": "0 0 24px rgba(143,167,176,0.12)",
        "soft-card": "0 8px 32px rgba(0,0,0,0.36)",
        glow: "0 0 12px rgba(143,167,176,0.40)",
        "glass-inner": "inset 0 1px 0 rgba(244,239,231,0.08)",
        "lesson-card": "0 4px 20px rgba(0,0,0,0.06)"
      },
      backgroundImage: { "site-mesh": "none", site: "none", "card-spot": "linear-gradient(135deg, rgba(244,239,231,0.04), rgba(244,239,231,0.01))", "hero-spot": "none", "obsidian-mesh": "none", "blue-gradient": "none", atmosphere: "none" },
      maxWidth: { shell: "1280px", prose: "720px" },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" }
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-4px) rotate(1deg)" }
        },
        "bounce-scroll": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(4px)" }
        },
        shimmer: {
          "0%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
          "100%": { opacity: "0.3" }
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "float-slow": "float-slow 5s ease-in-out infinite",
        "bounce-scroll": "bounce-scroll 2s ease-in-out infinite",
        shimmer: "shimmer 4s ease-in-out infinite",
        "fade-in-up": "fade-in-up 0.5s ease-out"
      }
    }
  },
  plugins: []
};

export default config;
