import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        jp: ["var(--font-jp)", "serif"],
        latin: ["var(--font-latin)", "serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
