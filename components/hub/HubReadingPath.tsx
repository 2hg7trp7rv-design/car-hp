import type { GuideItem } from "@/lib/guides";

import { Reveal } from "@/components/animation/Reveal";
import { HubRelatedGuidesGrid } from "@/components/hub/HubRelatedGuidesGrid";

type Step = {
  id: string;
  label: string;
  description: string;
  guides: GuideItem[];
};

type Props = {
  title?: string;
  lead?: string;
  steps: Step[];
  /** Hub slug を明示したい場合（tracking を安定させる） */
  fromIdOverride?: string;
  /** 背景トーンに合わせる */
  theme?: "light" | "dark";
  /** トラッキング用の棚IDプレフィックス（省略時は既定値） */
  shelfIdPrefix?: string;
};

export function HubReadingPath({
  title = "おすすめ記事",
  lead,
  steps,
  fromIdOverride,
  theme = "light",
  shelfIdPrefix = "hub_reading_path",
}: Props) {
  if (!steps || steps.length === 0) return null;

  return (
    <section id="reading" className="mb-12 scroll-mt-28">
      <Reveal>
        <div className="mb-5">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-[var(--text-tertiary)]">
            おすすめ記事
          </p>
          <h2 className="serif-heading mt-2 text-xl text-[var(--text-primary)]">{title}</h2>
          {lead ? (
            <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-[var(--text-secondary)]">
              {lead}
            </p>
          ) : null}
        </div>
      </Reveal>

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className="rounded-[20px] border border-[var(--border-default)] bg-[var(--surface-1)] p-4 sm:p-5"
          >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 items-center rounded-full bg-[rgba(122,135,108,0.08)] px-3 text-[10px] font-semibold tracking-[0.22em] text-[var(--text-secondary)]">
                  観点 {idx + 1}
                </span>
                <div>
                  <p className="text-[13px] font-semibold leading-snug text-[var(--text-primary)]">
                    {step.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[var(--text-secondary)]">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>

            <HubRelatedGuidesGrid
              guides={step.guides}
              fromIdOverride={fromIdOverride}
              theme={theme}
              shelfId={`${shelfIdPrefix}_${step.id}`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default HubReadingPath;
