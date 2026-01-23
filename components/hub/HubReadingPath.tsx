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
  title = "まず読む順番（この6本）",
  lead = "迷ったら、この順で読めばOK。必要な判断材料だけを先に揃えます。",
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
          <p className="text-[10px] font-semibold tracking-[0.3em] text-slate-500">
            READING PATH
          </p>
          <h2 className="serif-heading mt-2 text-xl text-slate-900">{title}</h2>
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-slate-600">
            {lead}
          </p>
        </div>
      </Reveal>

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            className="rounded-3xl border border-slate-200/80 bg-white/65 p-4 shadow-soft sm:p-5"
          >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 inline-flex h-7 items-center rounded-full bg-slate-900/5 px-3 text-[10px] font-semibold tracking-[0.22em] text-slate-700">
                  STEP {idx + 1}
                </span>
                <div>
                  <p className="text-[13px] font-semibold leading-snug text-slate-900">
                    {step.label}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
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
