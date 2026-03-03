import { useId } from "react";
import { cn } from "@/lib/utils";
import { hashStringToUint32, seedToUnit } from "@/lib/seed";

type Variant = "car" | "guide" | "column" | "heritage" | "generic";

type Props = {
  seedKey: string;
  variant?: Variant;
  className?: string;
  /** decorative by default */
  decorative?: boolean;
  /** accessible label when decorative=false */
  label?: string;
};

function pickVariantAccent(variant: Variant): { stroke: string; glow: string } {
  // Keep CBJ's Tiffany accent, but shift opacity per domain.
  switch (variant) {
    case "car":
      return { stroke: "rgba(10,186,181,0.62)", glow: "rgba(10,186,181,0.12)" };
    case "guide":
      return { stroke: "rgba(10,186,181,0.55)", glow: "rgba(10,186,181,0.10)" };
    case "column":
      return { stroke: "rgba(10,186,181,0.50)", glow: "rgba(10,186,181,0.09)" };
    case "heritage":
      return { stroke: "rgba(10,186,181,0.58)", glow: "rgba(10,186,181,0.11)" };
    default:
      return { stroke: "rgba(10,186,181,0.52)", glow: "rgba(10,186,181,0.10)" };
  }
}

export function SeedPoster({
  seedKey,
  variant = "generic",
  className,
  decorative = true,
  label,
}: Props) {
  const seed = hashStringToUint32(`${variant}:${seedKey}`);
  const uid = useId();
  const u1 = seedToUnit(seed, 1);
  const u2 = seedToUnit(seed, 2);
  const u3 = seedToUnit(seed, 3);
  const u4 = seedToUnit(seed, 4);

  const layout = Math.floor(seedToUnit(seed, 11) * 4); // 0..3
  const { stroke, glow } = pickVariantAccent(variant);

  const cx = 18 + u1 * 64;
  const cy = 10 + u2 * 36;
  const r1 = 12 + u3 * 22;
  const r2 = r1 + 10 + u4 * 16;

  const diag = 18 + seedToUnit(seed, 21) * 26;
  const wave = 6 + seedToUnit(seed, 31) * 10;

  const ariaProps = decorative
    ? ({ "aria-hidden": true } as const)
    : ({
        role: "img",
        "aria-label": (label ?? "").trim() || "Poster",
      } as const);

  return (
    <svg
      {...ariaProps}
      viewBox="0 0 100 56"
      preserveAspectRatio="none"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id={"cbj_poster_bg_" + seed + "_" + uid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.96" />
          <stop offset="0.55" stopColor="#f5f6f8" stopOpacity="0.96" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.92" />
        </linearGradient>

        <radialGradient id={"cbj_poster_glow_" + seed + "_" + uid} cx="0.32" cy="0.18" r="0.9">
          <stop offset="0" stopColor={glow} />
          <stop offset="1" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        <pattern
          id={"cbj_poster_grid_" + seed + "_" + uid}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 8 0 L 0 0 0 8"
            fill="none"
            stroke="rgba(15,23,42,0.10)"
            strokeWidth="0.35"
          />
        </pattern>
      </defs>

      <rect width="100" height="56" fill={"url(#cbj_poster_bg_" + seed + "_" + uid + ")"} />
      <rect width="100" height="56" fill={"url(#cbj_poster_grid_" + seed + "_" + uid + ")"} opacity="0.55" />
      <rect width="100" height="56" fill={"url(#cbj_poster_glow_" + seed + "_" + uid + ")"} />

      {layout === 0 && (
        <>
          <circle cx={cx} cy={cy} r={r1} fill="none" stroke={stroke} strokeWidth="0.6" />
          <circle cx={cx} cy={cy} r={r2} fill="none" stroke={stroke} strokeWidth="0.35" opacity="0.75" />
          <path
            d={`M 0 ${diag} L 100 ${diag - 10}`}
            stroke="rgba(15,23,42,0.22)"
            strokeWidth="0.35"
          />
        </>
      )}

      {layout === 1 && (
        <>
          {Array.from({ length: 6 }).map((_, i) => {
            const y = 10 + i * 7.2 + (i % 2 === 0 ? wave : -wave) * 0.25;
            return (
              <path
                key={i}
                d={`M 0 ${y} C 18 ${y - wave}, 36 ${y + wave}, 54 ${y} S 90 ${y - wave}, 100 ${y}`}
                fill="none"
                stroke={i === 2 ? stroke : "rgba(15,23,42,0.18)"}
                strokeWidth={i === 2 ? 0.55 : 0.35}
                opacity={i === 2 ? 0.95 : 0.9}
              />
            );
          })}
        </>
      )}

      {layout === 2 && (
        <>
          <path
            d="M 0 44 L 100 12"
            stroke={stroke}
            strokeWidth="0.55"
            opacity="0.9"
          />
          <path
            d="M 0 48 L 100 16"
            stroke="rgba(15,23,42,0.18)"
            strokeWidth="0.35"
          />
          <path
            d="M 0 40 L 100 8"
            stroke="rgba(15,23,42,0.14)"
            strokeWidth="0.35"
          />
          <circle cx={82} cy={16} r={6.5} fill="none" stroke={stroke} strokeWidth="0.45" />
          <circle cx={82} cy={16} r={2.2} fill={stroke} opacity="0.55" />
        </>
      )}

      {layout === 3 && (
        <>
          {Array.from({ length: 9 }).map((_, i) => {
            const x = 8 + i * 10.5;
            const y = 10 + ((i * 7) % 30);
            const rr = 2.2 + (seedToUnit(seed, 70 + i) * 5.5);
            const op = 0.18 + seedToUnit(seed, 90 + i) * 0.18;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={rr}
                fill={i % 3 === 0 ? stroke : "rgba(15,23,42,0.18)"}
                opacity={op}
              />
            );
          })}
          <rect
            x="8"
            y="36"
            width="84"
            height="1"
            fill={stroke}
            opacity="0.55"
          />
        </>
      )}
    </svg>
  );
}
