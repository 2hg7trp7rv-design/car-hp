export type LegalNavItem = {
  href: string;
  label: string;
  description: string;
  group: "運営と編集" | "利用と権利";
};

export const LEGAL_NAV_ITEMS: LegalNavItem[] = [
  {
    href: "/legal/about",
    label: "運営者情報",
    description: "サイトの目的と運営の姿勢",
    group: "運営と編集",
  },
  {
    href: "/legal/editorial-policy",
    label: "編集方針",
    description: "記事制作と公開後の更新方針",
    group: "運営と編集",
  },
  {
    href: "/legal/sources-factcheck",
    label: "出典・ファクトチェック",
    description: "一次情報の優先順位と確認範囲",
    group: "運営と編集",
  },
  {
    href: "/legal/ads-affiliate-policy",
    label: "広告・アフィリエイト",
    description: "収益化と編集判断の距離感",
    group: "運営と編集",
  },
  {
    href: "/legal/privacy",
    label: "プライバシーポリシー",
    description: "取得する情報と利用目的",
    group: "利用と権利",
  },
  {
    href: "/legal/disclaimer",
    label: "免責事項",
    description: "掲載情報の範囲と利用時の注意",
    group: "利用と権利",
  },
  {
    href: "/legal/copyright",
    label: "著作権・引用ポリシー",
    description: "文章・画像・引用の扱い",
    group: "利用と権利",
  },
];

export const LEGAL_NAV_GROUPS = [
  {
    id: "editorial",
    title: "運営と編集",
    lead: "サイトの目的、編集姿勢、広告との向き合い方をまとめた基準",
    items: LEGAL_NAV_ITEMS.filter((item) => item.group === "運営と編集"),
  },
  {
    id: "rights",
    title: "利用と権利",
    lead: "個人情報、免責、著作権など、利用前に確認できる基本事項",
    items: LEGAL_NAV_ITEMS.filter((item) => item.group === "利用と権利"),
  },
] as const;
