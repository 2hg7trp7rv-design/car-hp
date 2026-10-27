import type { CategorySlug } from "@/lib/categories";
import type { Speaker } from "@/lib/characters";
import type { FigureId } from "@/components/figures";

export type Block =
  | { type: "talk"; who: Speaker; text: string }
  | { type: "text"; text: string }
  | { type: "figure"; figure: FigureId; caption: string }
  | { type: "steps"; items: { title: string; text: string }[] }
  | { type: "point"; title: string; text: string }
  | { type: "ng"; title: string; items: { title: string; text: string }[] };

export type Section = { id: string; title: string; blocks: Block[] };

export type Source = { title: string; publisher: string; url: string; date?: string };

export type Article = {
  slug: string;
  category: CategorySlug;
  title: string;
  /** 一覧・検索結果・SNSの共有文に使う短い説明 */
  description: string;
  /** OGP画像に大きく出す短い見出し。\n の位置で改行する */
  shareTitle: string;
  publishedAt: string;
  updatedAt: string;
  /** 冒頭でシュナが投げる質問 */
  question: string;
  learn: string[];
  sections: Section[];
  summary: string[];
  sources: Source[];
};
