import audit from "@/src/generated/audit.generated.json";
import { NOINDEX_ROBOTS } from "@/lib/seo/robots";
import { DetailFixedBackground } from "@/components/layout/DetailFixedBackground";

export const metadata = {
  title: "Content Audit | _internal",
  robots: NOINDEX_ROBOTS,
};

type IssueRow = {
  type: string;
  slug: string;
  url?: string | null;
  file?: string;
  code?: string;
  message?: string;
  publicState?: string;
};

export default function InternalQualityPage() {
  const summary = audit?.summary as any;
  const errors = (audit?.errors || []) as IssueRow[];
  const warnings = (audit?.warnings || []) as any[];
  const generatedAt = (audit as any)?.generatedAt as string | undefined;

  return (
    <main className="relative min-h-screen text-white">
      <DetailFixedBackground />
      <div className="page-shell pb-24 pt-24">
        <div className="porcelain porcelain-panel rounded-3xl border border-[#222222]/10 bg-white/92 text-[#222222] shadow-soft-card backdrop-blur p-6 sm:p-8">
          <div className="mx-auto max-w-5xl px-4 py-10">
                  <h1 className="text-2xl font-bold">Content Quality Audit</h1>

                  <p className="mt-2 text-sm text-muted-foreground">
                    Generated: <span className="font-mono">{generatedAt}</span>
                  </p>

                  <section className="mt-8 rounded-lg border p-4">
                    <h2 className="text-lg font-semibold">Summary</h2>
                    <ul className="mt-3 space-y-1 text-sm">
                      <li>
                        Totals:{" "}
                        <span className="font-mono">
                          cars={summary?.totals?.CAR ?? 0} / guides={summary?.totals?.GUIDE ?? 0} / columns=
                          {summary?.totals?.COLUMN ?? 0} / heritage={summary?.totals?.HERITAGE ?? 0}
                        </span>
                      </li>
                      <li>
                        PublicState=index: <span className="font-mono">{summary?.all?.index ?? 0}</span>
                      </li>
                      <li>
                        Errors: <span className="font-mono">{summary?.errorCount ?? errors.length}</span>
                      </li>
                      <li>
                        Warnings: <span className="font-mono">{summary?.warningCount ?? warnings.length}</span>
                      </li>
                    </ul>
                  </section>

                  <section className="mt-8">
                    <h2 className="text-lg font-semibold">Blocking errors</h2>

                    {errors.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">No errors 🎉</p>
                    ) : (
                      <div className="mt-3 overflow-x-auto rounded-lg border">
                        <table className="w-full text-left text-sm">
                          <thead className="border-b bg-muted/40">
                            <tr>
                              <th className="px-3 py-2">Type</th>
                              <th className="px-3 py-2">Slug</th>
                              <th className="px-3 py-2">URL</th>
                              <th className="px-3 py-2">Code</th>
                              <th className="px-3 py-2">Message</th>
                            </tr>
                          </thead>
                          <tbody>
                            {errors.slice(0, 200).map((e, i) => (
                              <tr key={i} className="border-b last:border-b-0">
                                <td className="px-3 py-2 font-mono">{e.type}</td>
                                <td className="px-3 py-2 font-mono">{e.slug}</td>
                                <td className="px-3 py-2 font-mono">{e.url ?? ""}</td>
                                <td className="px-3 py-2 font-mono">{e.code ?? ""}</td>
                                <td className="px-3 py-2">{e.message ?? ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {errors.length > 200 ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Showing first 200 errors. Full JSON: <span className="font-mono">/_internal/audit.json</span>
                      </p>
                    ) : null}
                  </section>

                  <section className="mt-8">
                    <h2 className="text-lg font-semibold">Warnings</h2>
                    {warnings.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">No warnings.</p>
                    ) : (
                      <div className="mt-3 overflow-x-auto rounded-lg border">
                        <table className="w-full text-left text-sm">
                          <thead className="border-b bg-muted/40">
                            <tr>
                              <th className="px-3 py-2">Type</th>
                              <th className="px-3 py-2">Slug</th>
                              <th className="px-3 py-2">URL</th>
                              <th className="px-3 py-2">Code</th>
                              <th className="px-3 py-2">Message</th>
                            </tr>
                          </thead>
                          <tbody>
                            {warnings.slice(0, 200).map((w: any, i: number) => (
                              <tr key={i} className="border-b last:border-b-0">
                                <td className="px-3 py-2 font-mono">{w.type}</td>
                                <td className="px-3 py-2 font-mono">{w.slug}</td>
                                <td className="px-3 py-2 font-mono">{w.url ?? ""}</td>
                                <td className="px-3 py-2 font-mono">{w.code ?? ""}</td>
                                <td className="px-3 py-2">{w.message ?? ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  <section className="mt-10 text-xs text-muted-foreground">
                    <p>
                      Raw JSON: <span className="font-mono">public/_internal/audit.json</span>（robots で遮断）
                    </p>
                  </section>
          </div>
        </div>
      </div>
    </main>
  );}
