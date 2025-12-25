# SEO_DISCOVER_RULES（SEO & Discover）

最終更新: 2025-12-25

## 基本方針
- Discoverは “検索意図” より **興味喚起（Timeliness / Novelty / Story）** が効く。
- 一方でCAR BOUTIQUEは、煽りではなく **知的・重厚** を保つ。

## Discoverに寄りやすい題材（サイト適合）
- 周年（30年/25年/20年）× 再評価
- “誤解の訂正” × 固有事実（規制/市場/技術）
- 技術転換点（NA↔ターボ、軽量↔安全、機械式↔電子制御）

## タイトル/リードのルール
- タイトル：固有名詞 + 断言（ただし根拠が本文にある）
- リード：煽りで引っ張らず「何が分かるか」を約束する

## 構造化データ（絶対に落とさない）
- Article（HERITAGE/COLUMN/GUIDE） + BreadcrumbList
- Product（CARS） + BreadcrumbList（現行仕様に準拠）
- JSON-LDの型を勝手に変えない（リファクタで落としやすい）

## 計測（落とさない）
- ScrollDepthなどのイベント名・発火条件は不変
