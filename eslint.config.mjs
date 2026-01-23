// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 旧 .eslintrc 形式の設定（eslint-config-next）を
// Flat Config で使うための互換レイヤー
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // JS の推奨設定
  js.configs.recommended,

  // Next.js 推奨設定（core-web-vitals）
  ...compat.extends("next/core-web-vitals"),

  // プロジェクト固有ルール
  {
    rules: {
      // すでに <img> を使っているため
      "@next/next/no-img-element": "off",
      // 必要に応じてここにルールを追加
      // "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
