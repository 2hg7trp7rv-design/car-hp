// lib/monetize/hubPresets.ts

/**
 * monetizeKey ごとの “内部リンクHUBカード” プリセット
 * - HERITAGEには出さない（GUIDE内でのみ利用想定）
 * - ここを変えるだけで導線を差し替え可能
 */

export type HubPresetItem = {
  title: string;
  description?: string;
  href: string;
};

export function getHubPreset(monetizeKey?: string | null): HubPresetItem[] {
  if (!monetizeKey) return [];

  switch (monetizeKey) {
    case "sell_basic_checklist":
    case "sell_import_highclass":
    case "sell_loan_remains":
      return [
        {
          title: "売却前にやるべき写真・準備",
          description: "査定のブレを減らし、納得感を上げる。撮影と書類の型。",
          href: "/guide/photo-guide-for-selling",
        },
        {
          title: "オンライン査定の使い方",
          description: "一括/オンラインの使い分け。相場把握から交渉まで。",
          href: "/guide/how-to-use-online-assessment",
        },
        {
          title: "ローン残債がある車の売却",
          description: "残債があっても動ける順序。買取/乗換えの選択肢を整理。",
          href: "/guide/sell-while-loan-remains",
        },
      ];

    case "insurance_compare":
      return [
        {
          title: "補償の選び方（輸入車/高級車）",
          description: "車両保険・免責・特約。悩みやすい論点を整理。",
          href: "/guide/luxury-car-insurance-coverage",
        },
        {
          title: "購入前にかかる税金・諸費用",
          description: "本体価格+αの正体を分解して予算のズレを防ぐ。",
          href: "/guide/tax-and-fees-before-buying-import",
        },
        {
          title: "旧車の維持費の考え方",
          description: "整備/予防交換/保険。維持できる予算の立て方。",
          href: "/guide/oldtimer-maintenance-budget",
        },
      ];

    default:
      return [];
  }
}
