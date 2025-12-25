// components/content/InlineText.tsx

import React from "react";
import { tokenizeInline } from "@/lib/content/inline";

export function InlineText({ text }: { text: string }) {
  const tokens = tokenizeInline(text);

  return (
    <>
      {tokens.map((t, i) => {
        if (t.type === "bold") {
          return (
            <strong key={`b-${i}`} className="font-semibold text-slate-900">
              {t.value}
            </strong>
          );
        }

        if (t.type === "url") {
          return (
            <a
              key={`u-${i}`}
              href={t.value}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-tiffany-400/80 underline-offset-2"
            >
              {t.value}
            </a>
          );
        }

        return <React.Fragment key={`t-${i}`}>{t.value}</React.Fragment>;
      })}
    </>
  );
}
