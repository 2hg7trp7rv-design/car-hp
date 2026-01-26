// app/_internal/playbook/page.tsx

import type { Metadata } from "next";

import { CBJ_PLAYBOOK, CBJ_PLAYBOOK_VERSION } from "@/docs/CBJ_PLAYBOOK";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";

export const metadata: Metadata = {
  title: `Playbook (Internal) v${CBJ_PLAYBOOK_VERSION}`,
  description: "CAR BOUTIQUE JOURNAL Growth Playbook (Internal)",
  robots: NOINDEX_ROBOTS,
};

export default function InternalPlaybookPage() {
  return (
    <main className="mx-auto max-w-4xl px-5 py-10">
      <div className="mb-6">
        <p className="text-[11px] tracking-[0.22em] text-slate-500">
          INTERNAL / PLAYBOOK
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          Growth Playbook
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          v{CBJ_PLAYBOOK_VERSION}（noindex）
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <pre className="whitespace-pre-wrap break-words text-[12px] leading-[1.9] text-slate-800">
          {CBJ_PLAYBOOK}
        </pre>
      </div>
    </main>
  );
}
