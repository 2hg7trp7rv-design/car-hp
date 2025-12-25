// lib/content/blocks.ts
// Shared "markdown-ish" body parser used by guide/column readers.
// Supports:
// - ## Heading (h2)
// - ### Heading (h3)
// - - list items (unordered)
// - paragraphs

export type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

export type ContentBlock =
  | { type: "heading"; heading: Heading }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export function parseBodyToBlocks(body: string): { blocks: ContentBlock[]; headings: Heading[] } {
  const text = (body ?? "").trim();
  if (!text) return { blocks: [], headings: [] };

  const lines = text.split(/\r?\n/);
  const blocks: ContentBlock[] = [];
  const headings: Heading[] = [];

  let currentParagraph: string[] = [];
  let currentList: string[] = [];

  const flushParagraph = () => {
    const joined = currentParagraph.join(" ").trim();
    if (joined) blocks.push({ type: "paragraph", text: joined });
    currentParagraph = [];
  };

  const flushList = () => {
    if (currentList.length > 0) blocks.push({ type: "list", items: [...currentList] });
    currentList = [];
  };

  for (let index = 0; index < lines.length; index++) {
    const raw = lines[index] ?? "";
    const line = raw.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      const heading: Heading = { id: `h3-${index}`, text: line.slice(4).trim(), level: 3 };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      const heading: Heading = { id: `h2-${index}`, text: line.slice(3).trim(), level: 2 };
      blocks.push({ type: "heading", heading });
      headings.push(heading);
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      currentList.push(line.slice(2).trim());
      continue;
    }

    // Default: paragraph continuation
    flushList();
    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();

  return { blocks, headings };
}

export function extractStepHeadings(headings: Heading[]): Heading[] {
  return headings.filter((h) => /^STEP\s*\d+/i.test(h.text));
}
