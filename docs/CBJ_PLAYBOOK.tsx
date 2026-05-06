// docs/CBJ_PLAYBOOK.tsx

/**
 * CAR BOUTIQUE JOURNAL: Growth Playbook
 *
 * 目的:
 * - このリポジトリに「永遠に残る指針」を置く
 * - 何を直すべきかを “ページ単位 / 変更単位” まで具体化する
 * - コンテンツ量産の前に「勝てる型」と「noindexの基準」を固定する
 */

export const CBJ_PLAYBOOK_VERSION = "2026-01-04";

export const CBJ_PLAYBOOK = `
# CAR BOUTIQUE JOURNAL Growth Playbook (SEO & Content)

Last updated: ${CBJ_PLAYBOOK_VERSION}

---

## 0. ゴール（最終）
- 月間 100万PV
- “野良状態”から、Googleに「検索で出す価値があるサイト」として認知させる

---

## 1. 大原則（これを破ると伸びない）
1) **薄いページは index させない**（noindex運用をコードで強制）
2) **検索意図に対して、1ページで答え切る**（途中で離脱させない）
3) **内部リンクは設計して貼る**（偶然に任せない）
4) **sitemap / canonical / robots は機械的に正しくする**（ミスは致命傷）

---

## 2. Index / Noindex 方針（固定ルール）

### 2-1) index して良いページ
- /（トップ）
- /guide（ガイド一覧）
- /guide/hub-*（ハブ）
- /guide/[slug]（ガイド詳細）
- /column（コラム一覧）
- /column/[slug]（コラム詳細）
- /heritage（HERITAGE一覧）
- /heritage/[slug]（HERITAGE詳細）
- /cars（車種一覧）
- /cars/[slug]（車種詳細）※ただし “完成基準” を満たすものだけ

### 2-2) noindex にするページ（厳守）
- すべての **絞り込みURL（?q=, ?tag=, ?maker= など）**
- NEWS 詳細（/news/[id]）は当面 noindex（薄くなりやすい & 重複しやすい）
- CARS 詳細（/cars/[slug]）は **完成基準を満たさないものは noindex**
- /_internal/*（このplaybook等）

---

## 3. “勝てる記事”の型（S+定義）

### 3-1) GUIDE（最優先：PVの起爆剤）
最低ライン（S+必須）
- 冒頭で **結論 / 走行可否 / 緊急度** を即表示（3行以内）
- 読者の「次の行動」が確定する（例：走っていい / 止める / どこへ連絡）
- 失敗しやすい落とし穴（誤解）を先に潰す
- 具体例（症状→原因候補→切り分け）
- 1次情報/信頼できる根拠を最低1つ（ユーザに説明できるレベル）
- FAQ 3〜6個（検索クエリ拾い）
- 内部リンク 3本以上（関連ガイド/コラム/車種へ）

“文章量”の目安
- 2,000〜4,000字（テーマによっては 5,000字でもOK）

### 3-2) COLUMN（体験・ノウハウ）
- まず「この記事でわかること」を短く
- 途中に **チェックリスト / 箇条書き** を必ず入れる
- 余談は切る（PVが欲しい段階では“読みやすさ”優先）

### 3-3) HERITAGE（検索で勝つには“構造”）
- 年代の流れ（タイムライン）
- なぜその時代にそうなったか（背景）
- 代表車種（3〜6台）
- “誤解されがちな話” を1つ入れる

### 3-4) CARS（薄いページは noindex）
完成基準（満たさないなら noindex）
- Summary（summaryLong or summary）が **180文字以上**
- 強み or 注意点（strengths / weaknesses / troubleTrends）に **3個以上**

---

## 4. 具体修正点（ページ → 変更内容 → 完了条件）

### P0（最優先 / ここが壊れてるとスタートラインに立てない）
1) **/sitemap.xml が 4xx にならないこと**
   - 変更: public/ の静的XML運用をやめ、Route HandlerでXMLを返す
   - 完了条件: 
     - https://carboutiquejournal.com/sitemap.xml が 200
     - /sitemaps/sitemap-*.xml が 200
     - Search Consoleで sitemap を送信して “成功”

2) NEWS 詳細の noindex（当面）
   - 変更: /news/[id] は robots: noindex,follow
   - 完了条件: Search ConsoleでURL検査→インデックス対象外（noindex）になる

3) CARS の “薄いページ” noindex
   - 変更: /cars/[slug] の generateMetadata で完成基準を満たさない場合 noindex
   - 完了条件: stub車種URLが noindex になり、完成記事だけが index

### P1（回遊とランキングの土台）
4) /guide を “入口ページ” にする（困りごと別の導線を追加）
   - 変更（例）:
     - ファーストビュー直下に「今すぐ困ってる」クイックリンク（警告灯/異音/漏れ/オーバーヒート/バッテリー/タイヤ）
     - 「購入・維持・保険・売却」4レーンのカード導線
     - “最初に読む” 10本を固定（isPinned / isFeatured を活用）
   - 完了条件:
     - /guide → 記事詳細へのCTRが上がる（Search Console / Analytics）

5) /cars を “車種辞書” ではなく “購入判断ページ” に寄せる
   - 変更（例）:
     - 上部に「このページの使い方」＋代表的な探し方（メーカー/用途/予算）
     - “人気の車種” と “今読むべきガイド” をセットで表示
   - 完了条件:
     - /cars → /cars/[slug] → /guide の回遊が生まれる

6) /column と /heritage の一覧に “テーマ導線” を足す
   - 変更（例）:
     - カテゴリ/シリーズ/代表記事へのカード導線
     - 連載のまとめページが無ければ作る
   - 完了条件:
     - 一覧ページの滞在時間が伸びる

7) 1記事あたり内部リンクの最低本数を固定（棚を必ず出す）
   - 変更:
     - GUIDE: 関連ガイド4 / 関連車種2 / 関連コラム2
     - COLUMN: 関連ガイド2 / 関連車種1
     - HERITAGE: 関連車種3 / 関連ガイド2
   - 完了条件:
     - すべての記事で “次に読む” が途切れない

### P2（E-E-A-T / 評価を取りに行く）
8) 監修 / 一次情報 / 更新履歴 の見せ方を統一する
   - 変更:
     - 各記事末尾に「根拠（出典/参考）」＋「更新日」＋「編集方針へのリンク」
   - 完了条件:
     - 主要記事で “信頼” を説明できる状態になる

9) “外部からの評価” を取りに行く（被リンク・サイテーション）
   - 変更:
     - SNSやコミュニティで引用される「チェックリスト」「図解」を用意
     - 数本だけでもいいので、引用されやすい形に磨く
   - 完了条件:
     - 指名検索 / サイテーションが増える

---

## 5. 運用ルール（迷ったらここに戻る）
- 量産より “勝てる型”
- noindexは恐れない（完成してから index）
- 新規記事: 週5より、週2でもS+を守る
- 既存記事のリライト: “検索意図のズレ” を直すのが最優先

`;

/**
 * 機械的に管理したい “修正バックログ”
 * - UI上のToDoにしても良いし、Issue化しても良い
 */
export type FixItem = {
  priority: "P0" | "P1" | "P2";
  target: string; // URL or Route
  change: string;
  done: string;
};

export const CBJ_FIX_BACKLOG: FixItem[] = [
  {
    priority: "P0",
    target: "/sitemap.xml, /sitemaps/sitemap-*.xml",
    change: "public静的XMLをやめ、Route HandlerでXMLを返す（200で返す）",
    done: "全sitemapが200 + Search Consoleで成功",
  },
  {
    priority: "P0",
    target: "/news/[id]",
    change: "当面 noindex,follow（薄さ&重複対策）",
    done: "URL検査で noindex が反映",
  },
  {
    priority: "P0",
    target: "/cars/[slug]",
    change: "完成基準を満たさない車種ページは noindex（stubのクロール停止）",
    done: "stubが noindex / 完成ページだけindex",
  },
  {
    priority: "P1",
    target: "/guide",
    change: "“困りごと別クイックリンク” + 4レーン導線 + “最初に読む10本” を追加",
    done: "一覧→詳細へのCTRが上がる",
  },
  {
    priority: "P1",
    target: "/cars",
    change: "“使い方” + “人気車種” + “今読むべきガイド” をセットで配置",
    done: "/cars→詳細→guide の回遊が生まれる",
  },
  {
    priority: "P1",
    target: "/column, /heritage",
    change: "テーマ/シリーズ導線をカードで追加（まとめページが無ければ作る）",
    done: "一覧ページの滞在時間が伸びる",
  },
  {
    priority: "P1",
    target: "全記事テンプレ",
    change: "内部リンク最低本数を固定（棚を必ず出す）",
    done: "全記事に関連棚がある",
  },
  {
    priority: "P2",
    target: "全記事末尾",
    change: "根拠（出典/参考）+ 更新日 + 編集方針リンク を統一",
    done: "主要記事で“信頼”を説明できる状態",
  },
  {
    priority: "P2",
    target: "外部評価",
    change: "引用されるチェックリスト/図解を作り、サイテーションを取りにいく",
    done: "指名検索/サイテーションが増える",
  },
];
