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
    description: "このサイトが何を目的に、どんな温度で運営されているか。",
    group: "運営と編集",
  },
  {
    href: "/legal/editorial-policy",
    label: "編集方針",
    description: "記事制作の姿勢と、公開後の更新・修正の考え方。",
    group: "運営と編集",
  },
  {
    href: "/legal/sources-factcheck",
    label: "出典・ファクトチェック",
    description: "一次情報をどう優先し、どこまで確認して書くか。",
    group: "運営と編集",
  },
  {
    href: "/legal/ads-affiliate-policy",
    label: "広告・アフィリエイト",
    description: "収益化と編集の距離感、表記ルールについて。",
    group: "運営と編集",
  },
  {
    href: "/legal/privacy",
    label: "プライバシーポリシー",
    description: "取得する情報の種類と、その利用目的について。",
    group: "利用と権利",
  },
  {
    href: "/legal/disclaimer",
    label: "免責事項",
    description: "掲載情報の範囲と、利用時に留意してほしい点。",
    group: "利用と権利",
  },
  {
    href: "/legal/copyright",
    label: "著作権・引用ポリシー",
    description: "文章・画像の扱いと、引用時の考え方について。",
    group: "利用と権利",
  },
];

export const LEGAL_NAV_GROUPS = [
  {
    id: "editorial",
    title: "運営と編集",
    lead: "サイトの目的、編集姿勢、広告との向き合い方をまとめた基準です。",
    items: LEGAL_NAV_ITEMS.filter((item) => item.group === "運営と編集"),
  },
  {
    id: "rights",
    title: "利用と権利",
    lead: "個人情報、免責、著作権など、利用前に確認できる基本事項です。",
    items: LEGAL_NAV_ITEMS.filter((item) => item.group === "利用と権利"),
  },
] as const;
