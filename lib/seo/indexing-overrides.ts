// lib/seo/indexing-overrides.ts
import rawOverrides from "@/data/indexing-overrides.json";

export type IndexingOverrideAction = "forceIndex" | "forceNoindex";

type OverrideGroup = {
  forceIndex?: string[];
  forceNoindex?: string[];
};

type OverridesShape = {
  version?: number;
  generatedAt?: string;
  note?: string;
  content?: Record<string, OverrideGroup | undefined> | undefined;
};

const overrides = rawOverrides as OverridesShape;

type CompiledGroup = {
  forceIndex: Set<string>;
  forceNoindex: Set<string>;
};

const cache = new Map<string, CompiledGroup>();

function toSet(values: unknown): Set<string> {
  if (!Array.isArray(values)) return new Set();
  const out = new Set<string>();
  for (const v of values) {
    if (typeof v !== "string") continue;
    const s = v.trim();
    if (s) out.add(s);
  }
  return out;
}

function getCompiledGroup(type: string): CompiledGroup {
  const key = type.toUpperCase();
  const hit = cache.get(key);
  if (hit) return hit;

  const group = overrides?.content?.[key];
  const compiled: CompiledGroup = {
    forceIndex: toSet(group?.forceIndex),
    forceNoindex: toSet(group?.forceNoindex),
  };
  cache.set(key, compiled);
  return compiled;
}

/**
 * Content 単位のインデックス強制ルール。
 *
 * 優先順位:
 * - forceNoindex
 * - forceIndex
 */
export function getIndexingOverrideForContent(
  type: string,
  slug: string,
): IndexingOverrideAction | null {
  const t = (type ?? "").trim();
  const s = (slug ?? "").trim();
  if (!t || !s) return null;

  const compiled = getCompiledGroup(t);
  if (compiled.forceNoindex.has(s)) return "forceNoindex";
  if (compiled.forceIndex.has(s)) return "forceIndex";
  return null;
}

export function getIndexingOverridesMeta(): Pick<
  OverridesShape,
  "version" | "generatedAt" | "note"
> {
  return {
    version: overrides?.version,
    generatedAt: overrides?.generatedAt,
    note: overrides?.note,
  };
}

export function getIndexingOverridesSnapshot(): Record<
  string,
  { forceIndex: string[]; forceNoindex: string[] }
> {
  const out: Record<string, { forceIndex: string[]; forceNoindex: string[] }> = {};
  const content = overrides?.content ?? {};
  for (const [k, v] of Object.entries(content)) {
    out[k] = {
      forceIndex: Array.isArray(v?.forceIndex) ? (v?.forceIndex as string[]) : [],
      forceNoindex: Array.isArray(v?.forceNoindex) ? (v?.forceNoindex as string[]) : [],
    };
  }
  return out;
}
