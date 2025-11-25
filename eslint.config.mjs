import nextPlugin from "eslint-config-next";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  ...nextPlugin(),
  {
    rules: {
      // 必要に応じて緩和したいルールをここに追加
      "@next/next/no-img-element": "off"
    }
  }
];
