import type { ReactNode } from "react";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-site text-text-main">
      <div className="page-shell pt-24 pb-24">{children}</div>
    </main>
  );
}
