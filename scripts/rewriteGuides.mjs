import fs from 'fs';
import path from 'path';

const ROOT = '/mnt/data/cbj-quality';
const DATA_DIR = path.join(ROOT, 'data');
const BODY_DIR = path.join(ROOT, '_revised_guides', 'bodies');

const TODAY = '2026-01-20';

/** @type {Record<string, string>} */
const summaryBySlug = {
  'bengoshi-hiyou-tokuyaku-guide': 'もらい事故など交渉が重い場面で役立つ弁護士費用特約。使える場面、上限、注意点を整理。',
  'best-time-to-sell-car': '車検・大きい整備・走行距離の節目を基準に、損しにくい売り時と2〜3週間の段取りをまとめます。',
  'best-time-to-sell-import-sedan': '輸入セダンの売却は販路と整備履歴が鍵。車検や大きい整備前に動くための判断軸と手順。',
  'car-accident-first-10-minutes': '事故直後10分でやることを順番で整理。安全確保、救護、警察連絡、記録、保険連絡まで。',
  'car-budget-simulation': '車の予算を月額化して考える手順。ローン・保険・税・車検・突発費まで含めたシミュレーション。',
  'car-loan-interest-rate-guide': '金利だけでなく手数料と総支払で比べるローン選び。期間調整や繰上返済の注意点も。',
  'compare-loan-lease-zancre': '通常ローン、残クレ、リースを総支払・自由度・リスクの3軸で比較し、失敗しない確認項目を整理。',
  'engine-check-light-first-response': 'チェックエンジンランプ点灯時の初動。点滅/点灯の違い、止まる判断、点検までの進め方。',
  'family-suv-budget-and-lifeplan': '子育て家庭のSUV選びを家計目線で整理。固定費の上限、3〜5年の見通し、優先すべき装備。',
  'hajimete-kuruma-uru-checklist': '初めての車売却をチェックリスト化。相場の掴み方、査定比較、書類と契約の注意点。',
  'how-to-choose-first-sports-car': '初めてのスポーツカー選び。用途と維持費を先に決め、状態チェックと試乗で外さないコツ。',
  'insurance-deductible-guide': '車両保険の免責金額の考え方。保険料とのトレードオフ、設定パターン、決め方の目安。',
  'jyuusho-henkou-shaken-shou': '引っ越し後の車検証住所変更の手順。必要書類、管轄変更の注意、変更後にやること。',
  'kuruma-ikkatsu-satei-shitsukoi-real': '一括査定の“しつこい”を減らす方法。連絡の指定、比較の絞り方、代替手段。',
  'loan-or-lump-sum': '現金一括かローンかの判断基準。生活防衛資金、金利、期間、売却時の残債リスクで整理。',
  'loan-vs-lease-luxury-sedan': '高級セダンのローンとリースを比較。月額ではなく総支払と契約条件で選ぶためのチェック。',
  'maintenance-cost-simulation': '税よりブレる維持費（タイヤ・消耗品・車検整備）を月額化して見積もる方法。',
  'meigi-henko-hitsuyou-shorui-futsuu': '普通車の名義変更に必要な書類と流れ。旧/新所有者それぞれの準備ポイント。',
  'meigi-henko-hitsuyou-shorui-kei': '軽自動車の名義変更に必要な書類と注意点。保管場所届出の要否も整理。',
  'new-grad-first-car-choice': '新社会人の1台目の選び方。月額上限、保険、状態、支払い方法まで現実的にまとめます。',
  'number-change-kibou-number-guide': '希望ナンバーの取り方を手順で整理。抽選/先着、申込から交付・取付までの流れ。',
  'oil-change-frequency-guide': 'オイル交換頻度の決め方。使い方別の考え方、フィルター、点検のコツ。',
  'oil-leak-first-response': 'オイル漏れの初動。走行継続の判断、オイル量の確認、修理へ伝える情報。',
  'overheat-coolant-leak-guide': 'オーバーヒート・冷却水漏れ時の対処。停車、冷却、危険な行動、ロードサービス判断。',
  'road-service-choice-guide': 'ロードサービスを選ぶ前に確認すべき補償。レッカー距離や鍵・燃料切れなど比較のコツ。',
  'repair-history-used-car-checklist': '中古車の修復歴の定義とチェック手順。書類・外観・試乗で見抜くポイント。',
  'selling-without-rush': '焦らされずに車を売るための段取り。期限と下限の決め方、条件確認、交渉のコツ。',
  'self-gas-station-beginner-mistake': 'セルフ給油のよくあるミスと安全な手順。燃料の入れ間違い時の正しい初動も。',
  'shako-shoumei-torikata': '車庫証明の取り方を手順で整理。管轄確認、配置図、申請から交付までの注意点。',
  'sharyou-hoken-necessary': '車両保険を付ける/付けない判断基準。代替可能性、修理費負担、補償範囲の考え方。',
  'subscription-vs-owning': '車のサブスクと所有を比較。含まれる費用、制約、総支払で判断する方法。',
  'tax-and-fees-before-buying-import': '輸入車の見積で見落としやすい税金・諸費用の見方。削れる項目と確認手順を整理。',
  'tire-replacement-cost-guide': 'タイヤ交換の総額の見方と時期の目安。工賃内訳、サイズ/種類による差、節約のコツ。',
  'tokkyu-hikisugi-chudan-guide': '自動車保険の等級引き継ぎと中断証明書。乗り換え・一時中断・家族への切替の注意点。',
  'used-import-car-buying-guide': '中古輸入車を失敗せずに買うためのチェック。整備履歴、保証、修復歴、初年度費用まで。',
  'yunyusha-koukya-uru-kaitori-strategy': '輸入高級車を高く売る戦略。販路選び、履歴と仕様の整理、比較と条件詰めの進め方。'
};

function readBody(slug) {
  const p = path.join(BODY_DIR, `${slug}.md`);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing body file: ${p}`);
  }
  const txt = fs.readFileSync(p, 'utf8');
  // Ensure unix newlines and trailing newline
  return txt.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\s+$/,'') + '\n';
}

function extractNextSlugs(body, validSlugs) {
  const lines = body.split('\n');
  const startIdx = lines.findIndex(l => l.trim() === '## 次に読む');
  if (startIdx === -1) return [];
  const out = [];
  for (let i = startIdx + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('## ')) break;
    const m = line.match(/^-\s+\/guide\/([a-z0-9-]+)/);
    if (m) {
      const slug = m[1];
      if (validSlugs.has(slug) && !out.includes(slug)) out.push(slug);
    }
  }
  return out;
}

// Load all guides and keep a map of slug -> file
const dataFiles = fs
  .readdirSync(DATA_DIR)
  .filter(f => /^guides\d*\.json$/.test(f))
  .sort();

/** @type {Record<string, any>} */
const byFile = {};
for (const f of dataFiles) {
  const p = path.join(DATA_DIR, f);
  const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
  byFile[f] = arr;
}

const allGuides = Object.values(byFile).flat();
const validSlugs = new Set(allGuides.map(g => g.slug));

// Apply updates
for (const f of dataFiles) {
  const arr = byFile[f];
  for (const g of arr) {
    const slug = g.slug;
    if (!validSlugs.has(slug)) continue;

    // Body
    const body = readBody(slug);
    g.body = body;

    // Summary / lead / SEO
    const summary = summaryBySlug[slug];
    if (summary) {
      g.summary = summary;
      g.lead = summary;
      g.seoDescription = summary;
    }

    // Related
    const nextSlugs = extractNextSlugs(body, validSlugs);
    const related = nextSlugs.filter(s => s !== slug).slice(0, 4);
    g.internalLinks = related;
    g.relatedGuideSlugs = related;
    g.relatedColumnSlugs = [];

    // Update stamp
    g.updatedAt = TODAY;
  }
}

// Validate internalLinks
for (const g of allGuides) {
  const bad = (g.internalLinks || []).filter(s => !validSlugs.has(s));
  if (bad.length) {
    throw new Error(`internalLinks has missing slugs for ${g.slug}: ${bad.join(',')}`);
  }
}

// Write back
for (const f of dataFiles) {
  const p = path.join(DATA_DIR, f);
  fs.writeFileSync(p, JSON.stringify(byFile[f], null, 2) + '\n', 'utf8');
}

console.log(`Updated ${allGuides.length} guides across ${dataFiles.length} files.`);

function getBodyForSlug(slug) {
  const fp = path.join(BODY_DIR, `${slug}.md`);
  if (!fs.existsSync(fp)) {
    throw new Error(`Missing body file: ${fp}`);
  }
  return fs.readFileSync(fp, 'utf8').trimEnd() + '\n';
}

function extractNextGuideSlugs(body) {
  // Extract the "## 次に読む" section and collect /guide/<slug> links.
  const idx = body.indexOf('## 次に読む');
  if (idx === -1) return [];

  const after = body.slice(idx);
  // Stop at the next H2 heading (## ) after the first line.
  const lines = after.split(/\r?\n/);
  const sectionLines = [];
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith('## ')) break;
    sectionLines.push(l);
  }
  const sectionText = sectionLines.join('\n');
  const re = /\/guide\/([a-z0-9-]+)/g;
  const out = [];
  const seen = new Set();
  let m;
  while ((m = re.exec(sectionText)) !== null) {
    const s = m[1];
    if (!summaryBySlug[s]) continue; // only keep known guide slugs
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}
