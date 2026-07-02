// lib/analytics/experiments.ts

import { trackExperimentAssign } from "@/lib/analytics/events";

type Variant = "A" | "B";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isVariant(value: unknown): value is Variant {
  return value === "A" || value === "B";
}

function getSearchParam(name: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

function parseOverrides(raw: string | undefined): Record<string, Variant> {
  if (!raw) return {};
  const map: Record<string, Variant> = {};
  // format: "hub-sell=A,insurance=B" (comma-separated)
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((pair) => {
      const [k, v] = pair.split("=").map((s) => s.trim());
      if (!k) return;
      if (isVariant(v)) map[k] = v;
    });
  return map;
}

function buildOverrideKeys(experimentId: string): string[] {
  const keys: string[] = [];
  const raw = experimentId.trim();
  if (!raw) return keys;

  keys.push(raw);

  const withoutSuffix = raw.replace(/_entry$/, "");
  if (withoutSuffix !== raw) keys.push(withoutSuffix);

  const kebab = withoutSuffix.replace(/_/g, "-");
  if (kebab !== withoutSuffix) keys.push(kebab);

  // hub_* は短縮キーも許可（例: hub_insurance_entry -> insurance / hub-insurance）
  if (withoutSuffix.startsWith("hub_")) {
    const short = withoutSuffix.replace(/^hub_/, "");
    keys.push(short);
    keys.push(short.replace(/_/g, "-"));
  }
  if (kebab.startsWith("hub-")) {
    const shortKebab = kebab.replace(/^hub-/, "");
    keys.push(shortKebab);
  }

  // ユニーク化
  return Array.from(new Set(keys.filter(Boolean)));
}

function getOverrideVariant(experimentId: string): { variant: Variant; source: string } | null {
  if (typeof window === "undefined") return null;

  // 1) query param (for QA):
  // - ab=A|B (global)
  // - ab_<experimentId>=A|B (per experiment)
  const perKey = `ab_${experimentId}`;
  const per = getSearchParam(perKey);
  if (isVariant(per)) return { variant: per, source: `query:${perKey}` };

  const global = getSearchParam("ab");
  if (isVariant(global)) return { variant: global, source: "query:ab" };

  // 2) env override (pin winner)

const envRaw = (process.env.NEXT_PUBLIC_AB_OVERRIDES ?? "") as string;
const envMap = parseOverrides(envRaw);

for (const k of buildOverrideKeys(experimentId)) {
  const env = envMap[k];
  if (isVariant(env)) return { variant: env, source: `env:NEXT_PUBLIC_AB_OVERRIDES:${k}` };
}

  // 3) local override (manual pin per browser)
  try {
    const local = window.localStorage.getItem(`cbj:exp_override:${experimentId}`);
    if (isVariant(local)) return { variant: local, source: "localStorage:override" };
  } catch {
    // ignore
  }

  return null;
}

function stableHash(input: string): number {
  // lightweight string hash (djb2-ish)
  let hash = 5381;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

export function getOrAssignVariant(params: {
  experimentId: string;
  contentId?: string;
  pageType?: string;
}): Variant {
  const { experimentId, contentId, pageType } = params;

  // SSR fallback: deterministic A
  if (!isBrowser()) return "A";

  // 0) pinned / forced variant
  const override = getOverrideVariant(experimentId);
  if (override) {
    const key = `cbj:exp:${experimentId}`;
    try {
      window.localStorage.setItem(key, override.variant);
    } catch {
      // ignore
    }

    trackExperimentAssign({
      experiment_id: experimentId,
      variant: override.variant,
      page_type: pageType,
      content_id: contentId,
      is_override: true,
      source: override.source,
    });

    return override.variant;
  }

  const key = `cbj:exp:${experimentId}`;
  const stored = window.localStorage.getItem(key);
  if (isVariant(stored)) return stored;

  // deterministic split by contentId when available (prevents flicker per page)
  const seed = `${experimentId}::${contentId ?? ""}`;
  const variant: Variant = stableHash(seed) % 2 === 0 ? "A" : "B";
  window.localStorage.setItem(key, variant);

  // fire once per browser assignment
  trackExperimentAssign({
    experiment_id: experimentId,
    variant,
    page_type: pageType,
    content_id: contentId,
    is_override: false,
    source: "assign:hash",
  });

  return variant;
}
