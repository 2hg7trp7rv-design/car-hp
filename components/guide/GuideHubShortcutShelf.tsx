"use client";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { TrackedLink } from "@/components/analytics/TrackedLink";

type LinkTone = "tiffany" | "slate" | "cyan" | "rose";

type LinkItem = {
  href: string;
  label: string;
  description: string;
  /**
   * ID for analytics / key. If omitted, it will be derived from href.
   */
  navId?: string;
  /**
   * Optional UI tone for the card.
   */
  tone?: LinkTone;
};

type Props = {
  title: string;
  links: LinkItem[];
};

function getHubIdFromHref(href: string): string {
  // /guide/<slug> or /guide/<slug>?...
  try {
    const path = href.split("?")[0];
    const parts = path.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "guide");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    return href;
  } catch {
    return href;
  }
}

function getToneClasses(tone?: LinkTone): {
  hoverBorder: string;
  titleHover: string;
} {
  switch (tone) {
    case "slate":
      return {
        hoverBorder: "hover:border-[var(--border-default)]",
        titleHover: "group-hover:text-[var(--text-primary)]",
      };
    case "cyan":
      return {
        hoverBorder: "hover:border-cyan-100",
        titleHover: "group-hover:text-cyan-700",
      };
    case "rose":
      return {
        hoverBorder: "hover:border-rose-100",
        titleHover: "group-hover:text-rose-700",
      };
    case "tiffany":
    default:
      return {
        hoverBorder: "hover:border-accent-100",
        titleHover: "group-hover:text-[var(--accent-strong)]",
      };
  }
}

export function GuideHubShortcutShelf(props: Props) {
  const { title, links } = props;

  if (!links?.length) return null;

  return (
    <section aria-label={title} className="mt-8">
      <Reveal>
        <div className="mb-3">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)]">
            次の行動
          </p>
          <h2 className="serif-heading mt-2 text-lg text-[var(--text-primary)]">{title}</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {links.map((item, index) => {
            const hubId = getHubIdFromHref(item.href);
            const navId = item.navId ?? `hub_${hubId}`;
            const tone = getToneClasses(item.tone);

            return (
              <Reveal key={`${navId}_${index}`} delay={60 + index * 60}>
                <TrackedLink
                  href={item.href}
                  toType="hub"
                  toId={hubId}
                  shelfId="guide_hub_shortcuts"
                  ctaId={navId}
                  className="block"
                >
                  <GlassCard
                    padding="lg"
                    magnetic
                    className={`group border border-[rgba(31,28,25,0.12)] bg-[var(--surface-1)] shadow-soft transition hover:-translate-y-[1px] ${tone.hoverBorder} hover:shadow-soft-card`}
                  >
                    <p className="text-[10px] font-semibold tracking-[0.22em] text-[var(--text-tertiary)]">
                      
                    </p>
                    <h3
                      className={`mt-2 font-serif text-[14px] font-semibold leading-snug text-[var(--text-primary)] ${tone.titleHover}`}
                    >
                      {item.label}
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-[var(--text-secondary)]">
                      {item.description}
                    </p>
                  </GlassCard>
                </TrackedLink>
              </Reveal>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
