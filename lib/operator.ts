// lib/operator.ts
//
// 運営者・著者情報の単一ソース。
// 以前は各ページ・JSON-LD・著者カードに「山田太郎」がハードコードされていたが、
// data/site/operator.json を唯一の参照元に統一する。
// 値はプレースホルダー（「要設定」）のままコミットし、実名公開のタイミングで
// JSON を差し替える運用を前提とする（詳細は docs/operator-setup.md）。

import operatorJson from "@/data/site/operator.json";

export type OperatorSns = {
  label: string;
  url: string;
};

export type Operator = {
  /** 運営者の表示名 */
  name: string;
  /** 肩書き（例: 運営・編集責任者） */
  title: string;
  /** 著者カード等に出す資格・経歴の一行表記 */
  credential: string;
  /** プロフィール本文 */
  bio: string;
  /** 専門領域 */
  expertise: string[];
  /** SNS / 外部プロフィール */
  sns: OperatorSns[];
};

const PLACEHOLDER = "要設定";

function cleanString(value: unknown, fallback = PLACEHOLDER): string {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [PLACEHOLDER];
  const out = value.filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  );
  return out.length > 0 ? out.map((v) => v.trim()) : [PLACEHOLDER];
}

function cleanSns(value: unknown): OperatorSns[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (v): v is { label: string; url: string } =>
        !!v &&
        typeof v === "object" &&
        typeof (v as any).label === "string" &&
        typeof (v as any).url === "string",
    )
    .map((v) => ({ label: v.label.trim(), url: v.url.trim() }));
}

/** 運営者情報を取得する（アプリ全体でこの関数だけを参照する） */
export function getOperator(): Operator {
  return {
    name: cleanString(operatorJson.name),
    title: cleanString(operatorJson.title),
    credential: cleanString((operatorJson as any).credential),
    bio: cleanString(operatorJson.bio),
    expertise: cleanStringArray(operatorJson.expertise),
    sns: cleanSns((operatorJson as any).sns),
  };
}

/** JSON-LD の Person 表現（@id 付き） */
export function getOperatorPersonJsonLd(siteUrl: string) {
  const operator = getOperator();
  const pageUrl = `${siteUrl}/legal/about`;
  return {
    "@type": "Person" as const,
    "@id": `${pageUrl}#operator`,
    name: operator.name,
    jobTitle: operator.credential,
    description: operator.bio,
    url: pageUrl,
    worksFor: {
      "@type": "Organization" as const,
      name: "CAR BOUTIQUE JOURNAL",
      url: siteUrl,
    },
  };
}
