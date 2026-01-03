"use client";

import { Reveal } from "@/components/animation/Reveal";
import { GlassCard } from "@/components/GlassCard";
import { TrackedLink } from "@/components/analytics/TrackedLink";

type LinkItem = {
  href: string;
  label: string;
  description: string;
  navId: string;
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

export function GuideHubShortcutShelf(props: Props) {
  const { title, links } = props;

  if (!links?.length) return null;

  return (
    <section aria-label={title} className="mt-8">
      <Reveal>
        <div className="mb-3">
          <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
            NEXT ACTION
          </p>
          <h2 className="serif-heading mt-2 text-lg text-slate-900">{title}</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {links.map((item, index) => (
            <Reveal key={item.navId} delay={60 + index * 60}>
              <TrackedLink
                href={item.href}
                toType="hub"
                toId={getHubIdFromHref(item.href)}
                shelfId="guide_hub_shortcuts"
                ctaId={item.navId}
                className="block"
              >
                <GlassCard
                  padding="lg"
                  magnetic
                  className="group border border-slate-200/80 bg-gradient-to-br from-vapor/80 via-white/95 to-white/90 shadow-soft transition hover:-translate-y-[1px] hover:border-tiffany-100 hover:shadow-soft-card"
                >
                  <p className="text-[10px] font-semibold tracking-[0.22em] text-slate-400">
                    HUB
                  </p>
                  <h3 className="mt-2 font-serif text-[14px] font-semibold leading-snug text-slate-900 group-hover:text-tiffany-700">
                    {item.label}
                  </h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </GlassCard>
              </TrackedLink>
            </Reveal>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
