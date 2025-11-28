// components/home/HomePrimaryNavPanel.tsx
"use client";

/**
 * HomePrimaryNavPanel
 * ------------------------------------------------
 * 以前ホーム上部に常時表示していた NEWS / CARS / COLUMN / GUIDE
 * の大きなカード用コンポーネント。
 *
 * いまは HomeNavDrawer（画面左下から出てくるドロワー）が
 * その役割を担っているため、このコンポーネントは
 * UI を一切描画しないダミーとして残してあります。
 *
 * 将来的に完全に不要になったら、import している箇所ごと
 * 削除しても問題ありません。
 */
export function HomePrimaryNavPanel() {
  return null;
}

export default HomePrimaryNavPanel;
