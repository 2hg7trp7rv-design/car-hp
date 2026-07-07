export type SearchDocType = "guide" | "column";

export type SearchDoc = {
  type: SearchDocType;
  id: string;
  slug: string;
  href: string;
  title: string;
  description: string;
  category?: string;
  tags?: string[];
  date?: string;
};

export type SearchHit = SearchDoc & {
  score: number;
};
