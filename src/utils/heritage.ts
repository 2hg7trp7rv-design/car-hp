// src/utils/heritage.ts

export type HeritageSection = {
  title: string;
  content: string;
};

/**
 * 記事本文（【見出し】本文...形式）を解析してセクション配列に変換する
 */
export const parseHeritageBody = (bodyText: string): HeritageSection[] => {
  if (!bodyText) return [];

  // "【" で分割し、空の要素を除外
  const rawSections = bodyText.split('【').filter(Boolean);

  return rawSections.map((section) => {
    // "】" で見出しと本文を分ける
    const splitIndex = section.indexOf('】');
    
    // "】"が見つからない場合はそのまま本文として扱う
    if (splitIndex === -1) {
      return { title: '', content: section.trim() };
    }

    const title = section.substring(0, splitIndex);
    const content = section.substring(splitIndex + 1).trim();

    return { title, content };
  });
};

/**
 * セクションのタイトルと関連車両リスト（slug）を照合して、マッチするslugを返す
 * 例: タイトルに"FC3S"が含まれていて、slugが"mazda-rx7-fc3s"ならマッチとする
 */
export const findMatchingCarSlug = (sectionTitle: string, relatedCarSlugs: string[] = []): string | undefined => {
  if (!sectionTitle || !relatedCarSlugs.length) return undefined;
  
  const normalizedTitle = sectionTitle.toLowerCase();

  return relatedCarSlugs.find((slug) => {
    // slugの末尾（モデルコード部分）を取得
    const parts = slug.split('-');
    const modelCode = parts[parts.length - 1]; // 例: "fc3s", "z32"
    
    // タイトルにモデルコードが含まれているかチェック
    return normalizedTitle.includes(modelCode);
  });
};
