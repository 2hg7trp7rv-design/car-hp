import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  { ignores: ["node_modules/**", "node_modules.nosync/**", ".next/**", ".next.nosync/**", "next-env.d.ts"] },
  js.configs.recommended,
  ...nextCoreWebVitals,
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
    },
  },
  {
    // OGP画像は next/og が描画するので、next/image ではなく img を使う
    files: ["lib/og.tsx"],
    rules: { "@next/next/no-img-element": "off" },
  },
];

export default config;
