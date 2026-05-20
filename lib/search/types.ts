export type SearchDocType = "cars" | "guide" | "column" | "heritage";

export type SearchDoc = {
  type: SearchDocType;
  id: string;
  slug: string;
  href: string;
  title: string;
  description: string;
  maker?: string;
  category?: string;
  tags?: string[];
  date?: string;
};

export type SearchHit = SearchDoc & {
  score: number;
};
