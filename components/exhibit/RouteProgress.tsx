"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import type { ExhibitionRoute } from "@/lib/exhibit/routes";

type Props = {
  route: ExhibitionRoute;
};

type Stored = {
  v: number;
  visited: string[];
  updatedAt: string;
};

const VERSION = 1;

function storageKey(routeId: string) {
  return `cbj:exhibit:route:${routeId}`;
}

function safeParse(json: string | null): Stored | null {
  if (!json) return null;
  try {
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== "object") return null;
    if (!Array.isArray(obj.visited)) return null;
    return {
      v: typeof obj.v === "number" ? obj.v : VERSION,
      visited: obj.visited.map((x: unknown) => String(x)).filter(Boolean),
      updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : "",
    };
  } catch {
    return null;
  }
}

function readVisited(routeId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey(routeId));
    const parsed = safeParse(raw);
    if (!parsed) return new Set();
    return new Set(parsed.visited);
  } catch {
    // Safari private mode / storage disabled can throw.
    return new Set();
  }
}

function writeVisited(routeId: string, visited: Set<string>) {
  if (typeof window === "undefined") return;
  const payload: Stored = {
    v: VERSION,
    visited: Array.from(visited),
    updatedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(storageKey(routeId), JSON.stringify(payload));
  } catch {
    // Ignore storage write failures; progress is non-critical.
  }
}

export function RouteProgress({ route }: Props) {
  const [visited, setVisited] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setVisited(readVisited(route.id));
  }, [route.id]);

  const steps = route.steps;
  const visitedCount = useMemo(() => {
    let n = 0;
    for (const s of steps) if (visited.has(String(s.href))) n += 1;
    return n;
  }, [steps, visited]);

  const firstUnvisited = useMemo(() => {
    return steps.find((s) => !visited.has(String(s.href))) ?? null;
  }, [steps, visited]);

  function mark(href: string) {
    const next = new Set(visited);
    next.add(String(href));
    setVisited(next);
    writeVisited(route.id, next);
  }

  function reset() {
    const next = new Set<string>();
    setVisited(next);
    writeVisited(route.id, next);
  }

  return (
    <GlassCard className="border border-[#222222]/10 bg-white/80 p-6" padding="none">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">PROGRESS</p>
          <h2 className="mt-2 font-serif text-[18px] font-semibold tracking-tight text-[#222222]">進捗</h2>
          <p className="mt-2 text-[12px] text-[#222222]/70">
            {visitedCount}/{steps.length} steps
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {firstUnvisited ? (
            <Button asChild variant="primary" size="sm" className="h-10 px-5">
              <Link href={firstUnvisited.href} onClick={() => mark(firstUnvisited.href)}>
                続きから開く
              </Link>
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="sm" className="h-10 px-5" onClick={reset}>
            リセット
          </Button>
        </div>
      </div>

      <ol className="mt-5 space-y-2">
        {steps.map((s, idx) => {
          const done = visited.has(String(s.href));
          return (
            <li key={s.href} className="flex items-center justify-between gap-4 rounded-2xl border border-[#222222]/10 bg-white/70 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold tracking-[0.22em] text-[#222222]/55">
                  {String(idx + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 truncate text-[12px] font-semibold text-[#222222]">{s.label}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-[0.18em] text-[#222222]/55">
                  {done ? "DONE" : "OPEN"}
                </span>
                <Button asChild variant="outline" size="sm" className="h-9 px-4">
                  <Link href={s.href} onClick={() => mark(s.href)}>
                    開く
                  </Link>
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
}
