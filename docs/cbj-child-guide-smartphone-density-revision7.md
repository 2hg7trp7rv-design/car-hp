# CBJ child GUIDE smartphone-density revision 7

## Scope

This revision tightens the child GUIDE pages before physical-device review, using the existing parent COLUMN code and shared CBJ world article layout as the baseline.

It does not claim real-device verification. The changes are based on repository-level review of article JSON, shared article components, and responsive CSS.

## Changes

### 1. Hero promise mobile density

Adjusted the mobile spacing and typography for `heroPromise` in `components/articleDesignSystem/article-design-system.module.css`.

- Reduced mobile padding.
- Reduced mobile line-height.
- Reduced mobile font size.
- Added a clearer gap before `heroMeta`.
- Added a `pageKimiMock`-specific mobile override so the renewed COLUMN/GUIDE world keeps the same visual baseline while avoiding a heavy first view.

### 2. Child GUIDE keyPoints compression

Compressed child GUIDE `keyPoints` from five items to three or four items.

Reason:

- The child GUIDE hero already contains `heroPromise` / 「この記事で判断できること」.
- Keeping five key points immediately after that created unnecessary mobile density and a more template-like impression.
- Parent COLUMN can remain broader; child GUIDE pages should be lighter at the intro and stronger at the article-specific decision UI.

### 3. Article-specific check heading names

Replaced generic `最初に確認すること` headings with article-specific names:

| GUIDE | New heading |
|---|---|
| 社外エアクリーナー | 付ける前に見る吸気まわり / 純正戻しで比べる条件 / 装着前に残すもの |
| 足回り | 試乗条件を揃える |
| 電子制御ダンパー | 交換前に確認する制御と記録 / 車高調導入前チェック / 施工先に確認する質問 |
| ADASローダウン | ローダウン前のADAS確認 / 施工前後で残す記録 / 施工店に確認する質問 |
| TVキャンセラー | 取り付け前に分ける安全面と技術面 |
| カスタム済み中古車 | 現車確認で最初に見るもの / 販売店に確認する質問 |

Repeated generic labels such as `最初に確認すること` and `取り付け前チェック` were removed from the target child GUIDE pages.

### 4. Quality gate additions

Updated `scripts/verify-guide-decision-json.mjs`:

- Child GUIDE `keyPoints` must not exceed four visible items.
- Child GUIDE public text must not keep generic headings such as `最初に確認すること` or `取り付け前チェック`.

These checks are designed to prevent future AI-generated GUIDE pages from drifting back into a dense, uniform template.

## Verification performed

The following scripts were run successfully in this repository checkout:

```text
node scripts/verify-guide-decision-json.mjs
node scripts/verify-article-design-system.mjs
node scripts/content-audit.mjs
node scripts/verify-internal-links.mjs
node scripts/generate-sitemaps.mjs
node scripts/verify-sitemaps.mjs
node scripts/generate-public-assets.mjs
node scripts/verify-public-asset-references.mjs
node scripts/generate-robots.mjs
node scripts/verify-robots.mjs
node scripts/verify-indexing-surface.mjs
```

Results:

```text
verify-guide-decision-json: OK
verify-article-design-system: OK
content-audit: OK, errors=0, warnings=94
internal links: OK
sitemaps: OK
public assets: OK
robots: OK
indexing surface: OK
```

## Not verified

- iPhone / Android physical-device display
- Vercel Preview URL
- Production deployment
- Full `npm run prebuild` with `tsc --noEmit`, because this extracted ZIP does not include `node_modules`
- Full `npm run build`, for the same reason
