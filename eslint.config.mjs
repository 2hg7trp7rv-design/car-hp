// eslint.config.mjs
import js from "@eslint/js";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    linterOptions: { reportUnusedDisableDirectives: false },
  },
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
  ...nextCoreWebVitals,
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "@next/next/no-img-element": "off",
      "@next/next/no-html-link-for-pages": "off",
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/static-components": "off",
      "react-hooks/use-memo": "off",
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-irregular-whitespace": "off",
      "no-useless-escape": "off",
      "no-mixed-spaces-and-tabs": "off",
      "react/no-unescaped-entities": "off",
      "no-constant-condition": ["error", { checkLoops: false }],
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
      "no-dupe-class-members": "off",
      "no-unused-vars": "off",
    },
  },
];

export default config;
