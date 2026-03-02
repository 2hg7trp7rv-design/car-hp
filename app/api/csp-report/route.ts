// CSP violation report endpoint
// - Content-Security-Policy-Report-Only / Content-Security-Policy の report-uri で受ける
// - 本番ではログ肥大化を避けるため、保存せず 204 で握りつぶす
//   (必要になれば、Sentry等に限定的に送る)

export async function POST(req: Request) {
  // ボディは仕様上 JSON とは限らないため、読み取りは best-effort
  try {
    const bodyText = await req.text();

    // 既定ではログを出さない（本番のログ肥大化防止）。
    // 必要なときだけ Vercel env: CSP_REPORT_LOG=1 を入れて確認する。
    const shouldLog = process.env.CSP_REPORT_LOG === "1";
    if (shouldLog && bodyText) {
      // レポート形式は UA により差があるため、パースは best-effort
      let parsed: unknown = bodyText;
      try {
        parsed = JSON.parse(bodyText);
      } catch {
        // keep as text
      }

      // 1デプロイで無限に増えないよう、プロセス単位で上限を持つ
      const g = globalThis as unknown as { __cbjCspReportCount?: number };
      g.__cbjCspReportCount = (g.__cbjCspReportCount ?? 0) + 1;
      if (g.__cbjCspReportCount <= 20) {
        // eslint-disable-next-line no-console
        console.log("[csp-report]", parsed);
      }
    }
  } catch {
    // ignore
  }

  return new Response(null, { status: 204 });
}

// Some user agents may send a preflight or probe.
export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
