// components/content/ContentBlocks.tsx

import React from "react";
import type { ContentBlock, Heading } from "@/lib/content/blocks";
import { InlineText } from "@/components/content/InlineText";
import { Reveal } from "@/components/animation/Reveal";

type Variant = "guide" | "column";

type Props = {
  blocks: ContentBlock[];
  variant: Variant;
};

function headingClass(variant: Variant, level: 2 | 3, text: string): string {
  if (variant === "guide") {
    const isStepHeading = /^STEP\s*\d+/i.test(text);
    if (isStepHeading) {
      return "mt-10 mb-4 text-sm font-semibold tracking-[0.18em] text-slate-800 sm:text-[13px] uppercase";
    }
    return level === 2
      ? "mt-10 mb-4 font-serif text-2xl tracking-[-0.01em] text-slate-900 sm:text-[28px]"
      : "mt-8 mb-3 font-serif text-xl tracking-[-0.01em] text-slate-900";
  }

  // column
  return level === 2
    ? "mt-10 mb-4 font-serif text-2xl tracking-[-0.01em] text-slate-900 sm:text-[28px]"
    : "mt-8 mb-3 font-serif text-xl tracking-[-0.01em] text-slate-900";
}

export function ContentBlocks({ blocks, variant }: Props) {
  let firstParagraphRendered = false;

  return (
    <div className="mt-6">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const Tag = block.heading.level === 2 ? "h2" : "h3";
          return (
            <Reveal key={`${block.heading.id}-${index}`} delay={60}>
              <Tag id={block.heading.id} className={headingClass(variant, block.heading.level, block.heading.text)}>
                <InlineText text={block.heading.text} />
              </Tag>
            </Reveal>
          );
        }

        if (block.type === "list") {
          if (variant === "guide") {
            return (
              <Reveal key={`list-${index}`} delay={60}>
                <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-slate-800 sm:text-[15px]">
                  {block.items.map((item, i) => (
                    <li key={`li-${index}-${i}`} className="flex gap-2">
                      <span className="mt-[7px] h-[3px] w-5 rounded-full bg-tiffany-300" />
                      <span>
                        <InlineText text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          }

          return (
            <Reveal key={`list-${index}`} delay={60}>
              <ul className="list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-text-main">
                {block.items.map((item, i) => (
                  <li key={`li-${index}-${i}`}>
                    <InlineText text={item} />
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        }

        // paragraph
        if (variant === "guide" && !firstParagraphRendered && block.text.trim().length > 0) {
          firstParagraphRendered = true;
          const firstChar = block.text[0];
          const rest = block.text.slice(1);

          return (
            <Reveal key={`p-${index}`} delay={60}>
              <p className="mt-4 text-sm leading-8 text-slate-800 sm:text-[15px] sm:leading-[2rem]">
                <span className="float-left mr-2 mt-1 font-serif text-4xl leading-none text-slate-900 sm:text-5xl">
                  {firstChar}
                </span>
                <InlineText text={rest} />
              </p>
            </Reveal>
          );
        }

        return (
          <Reveal key={`p-${index}`} delay={60}>
            <p
              className={
                variant === "guide"
                  ? "mt-4 text-sm leading-8 text-slate-800 sm:text-[15px] sm:leading-[2rem]"
                  : "text-[15px] leading-relaxed text-text-main"
              }
            >
              <InlineText text={block.text} />
            </p>
          </Reveal>
        );
      })}
    </div>
  );
}

export function TocList({ headings }: { headings: Heading[] }) {
  if (!Array.isArray(headings) || headings.length === 0) return null;

  return (
    <ol className="space-y-2 text-[12px] leading-relaxed text-text-sub">
      {headings.map((h) => (
        <li key={h.id} className={h.level === 3 ? "pl-3" : ""}>
          <a href={`#${h.id}`} className="hover:text-text-main">
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
