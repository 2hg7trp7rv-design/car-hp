import Image from "next/image";
import Link from "next/link";

import { resolveEditorialImage } from "@/lib/editorial-media";
import { cn } from "@/lib/utils";

type Tone = "glow" | "wash" | "fog" | "quiet";
type PosterVariant = "guide" | "column" | "car" | "heritage" | "generic";

const TONE_STYLES: Record<Tone, { wash: string; border: string; text: string }> = {
  glow: {
    wash: "bg-[var(--surface-glow)]",
    border: "border-[rgba(27,63,229,0.18)]",
    text: "text-[var(--accent-strong)]",
  },
  wash: {
    wash: "bg-[var(--surface-wash)]",
    border: "border-[rgba(27,63,229,0.18)]",
    text: "text-[var(--accent-base)]",
  },
  fog: {
    wash: "bg-[var(--surface-fog)]",
    border: "border-[rgba(27,63,229,0.18)]",
    text: "text-[var(--accent-base)]",
  },
  quiet: {
    wash: "bg-[var(--surface-2)]",
    border: "border-[rgba(76,69,61,0.18)]",
    text: "text-[var(--text-tertiary)]",
  },
};

type Stat = {
  label: string;
  value: string;
  tone?: Tone;
};

type LinkChip = {
  href: string;
  label: string;
};

type Props = {
  eyebrow: string;
  title: string;
  lead: string;
  note?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  seedKey?: string;
  posterVariant?: PosterVariant;
  stats?: Stat[];
  links?: LinkChip[];
  align?: "imageRight" | "imageLeft";
  className?: string;
};

export function ArchivePageHero({
  eyebrow,
  title,
  lead,
  note,
  imageSrc,
  imageAlt = "",
  seedKey = "archive",
  posterVariant = "generic",
  stats = [],
  links = [],
  align = "imageRight",
  className,
}: Props) {
  const resolvedImage = resolveEditorialImage(imageSrc ?? null, posterVariant, "desktop", seedKey);

  const media = (
    <div
      className={cn(
        "relative bg-[var(--surface-2)]",
        align === "imageRight"
          ? "border-t border-[var(--border-default)] lg:border-t-0 lg:border-l"
          : "border-[var(--border-default)] lg:border-r",
      )}
    >
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
        <Image
          src={resolvedImage.src}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 56vw"
          className={cn(
            "object-cover",
            resolvedImage.hasRealImage ? "saturate-[0.92]" : "opacity-[0.76] saturate-[0.82]",
          )}
        />
        <div
          className={cn(
            "absolute inset-0",
            resolvedImage.hasRealImage
              ? "bg-[linear-gradient(180deg,rgba(251,248,243,0.02),rgba(14,12,10,0.2))]"
              : "bg-[linear-gradient(180deg,rgba(251,248,243,0.28),rgba(251,248,243,0.12),rgba(14,12,10,0.12))]",
          )}
        />
        {!resolvedImage.hasRealImage ? (
          <div className="absolute inset-x-0 top-0 flex justify-end p-4">
            <span className="rounded-full border border-[rgba(251,248,243,0.5)] bg-[rgba(251,248,243,0.72)] px-3 py-1 text-[10px] tracking-[0.16em] text-[var(--text-secondary)] backdrop-blur-sm">
              イメージ
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );

  const content = (
    <div className="flex flex-col justify-between gap-8">
      <div>
        <p className="cb-kicker">{eyebrow}</p>
        <h1 className="mt-4 text-[34px] font-semibold leading-[1.06] tracking-[-0.06em] text-[var(--text-primary)] sm:text-[44px] lg:text-[58px]">
          {title}
        </h1>
        <p className="mt-5 max-w-[38rem] text-[15px] leading-[1.95] text-[var(--text-secondary)] sm:text-[16px]">
          {lead}
        </p>
        {note ? (
          <p className="mt-4 max-w-[34rem] text-[12px] leading-[1.8] text-[var(--text-tertiary)] sm:text-[13px]">
            {note}
          </p>
        ) : null}
      </div>

      {(stats.length > 0 || links.length > 0) ? (
        <div className="flex flex-col gap-4">
          {stats.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((stat, index) => {
                const tone = TONE_STYLES[stat.tone ?? "glow"];
                return (
                  <div
                    key={`${stat.label}-${index}`}
                    className={cn(
                      "rounded-[20px] border px-4 py-4",
                      tone.wash,
                      tone.border,
                    )}
                  >
                    <div className="text-[10px] font-semibold tracking-[0.18em] text-[var(--text-tertiary)]">
                      {stat.label}
                    </div>
                    <div className={cn("mt-2 text-[17px] font-semibold leading-tight", tone.text)}>
                      {stat.value}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {links.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="cb-chip">
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const columns =
    align === "imageLeft" ? (
      <>
        <div className="lg:col-span-7">{media}</div>
        <div className="border-t border-[var(--border-default)] p-4 sm:p-6 lg:col-span-5 lg:border-t-0 lg:p-8">
          {content}
        </div>
      </>
    ) : (
      <>
        <div className="p-4 sm:p-6 lg:col-span-5 lg:p-8">{content}</div>
        <div className="lg:col-span-7">{media}</div>
      </>
    );

  return (
    <section className={cn("cb-panel overflow-hidden", className)}>
      <div className="grid items-stretch gap-0 lg:grid-cols-12">{columns}</div>
    </section>
  );
}
