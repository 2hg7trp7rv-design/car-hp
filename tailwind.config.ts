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
        paper: "#F6F2EB",
        "paper-light": "#FBF8F3",
        ink: "#0E0C0A",
        "ink-soft": "#4C453D",
        cobalt: {
          DEFAULT: "#1B3FE5",
          deep: "#0F2DAA",
          glow: "rgba(27, 63, 229, 0.18)",
        },

        stage: "#F6F2EB",
        "surface-1": "#FBF8F3",
        "surface-2": "#EEE7DE",
        "surface-3": "#E4DBCF",
        "border-default": "rgba(14, 12, 10, 0.14)",
        "text-primary": "#0E0C0A",
        "text-secondary": "#4C453D",
        "text-tertiary": "#6B655D",
        accent: {
          DEFAULT: "#1B3FE5",
          strong: "#0F2DAA",
          subtle: "rgba(27, 63, 229, 0.18)",
        },
        success: "#1B3FE5",
        warning: "#1B3FE5",
        danger: "#AE3434",

        background: "#F6F2EB",
        "text-main": "#0E0C0A",
        "text-sub": "#4C453D",
        obsidian: "#0E0C0A",
        porcelain: "#FBF8F3",
        vapor: "#EEE7DE",
        ice: "#E4DBCF",


        brand: {
          white: "#FBF8F3",
          vapor: "#EEE7DE",
          blue: "#1B3FE5",
          black: "#0E0C0A",
          light: "rgba(14, 12, 10, 0.14)",
        },
      },

      fontFamily: {
        sans: [
          "var(--font-noto-sans-jp)",
          "var(--font-inter-tight)",
          "Hiragino Kaku Gothic ProN",
          "Hiragino Sans",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },

      spacing: {
        "4.5": "18px",
        "13": "52px",
        "15": "60px",
        "18": "72px",
        "22": "88px",
        "26": "104px",
        "27": "108px",
        "36": "144px",
        "54": "216px",
      },

      borderRadius: {
        btn: "14px",
        card: "18px",
        hero: "34px",
        pill: "9999px",
      },

      transitionTimingFunction: {
        cbj: "cubic-bezier(0.2, 0, 0, 1)",
      },
      transitionDuration: {
        "120": "120ms",
        "180": "180ms",
        "240": "240ms",
      },

      boxShadow: {
        soft: "0 4px 16px rgba(14, 12, 10, 0.10)",
        card: "0 18px 60px rgba(14, 12, 10, 0.14)",
        strong: "0 34px 110px rgba(14, 12, 10, 0.22)",
        "soft-glow": "0 0 36px rgba(27, 63, 229, 0.18)",
        "soft-card": "0 20px 70px rgba(14, 12, 10, 0.16)",
        glow: "0 0 20px rgba(27, 63, 229, 0.36)",
        "glass-inner": "inset 0 1px 0 rgba(251, 248, 243, 0.54)",
      },
    },
  },
  plugins: [],
};

export default config;
