// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const config = [
  {
    ignores: [
      "docs/**",
      "scripts/oneoffs/**",
      "node_modules/**",
      ".next/**",
      "**/tsconfig.tsbuildinfo",
    ],
  },
  js.configs.recommended,
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "@next/next/no-img-element": "off",
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-irregular-whitespace": "warn",
      "no-useless-escape": "warn",
      "no-mixed-spaces-and-tabs": "warn",
      "react/no-unescaped-entities": "warn",
      "no-constant-condition": ["warn", { checkLoops: false }],
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    rules: {
      "no-undef": "off",
    },
  },

  {
    files: ["**/*.d.ts"],
    rules: {
      // TypeScript declaration overloads are valid; ESLint core rule mis-detects them as duplicates
      "no-dupe-class-members": "off",
      "no-unused-vars": "off",
    },
  },
];

export default config;
