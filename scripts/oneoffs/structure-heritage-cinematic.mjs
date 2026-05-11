import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const heritageDir = path.join(root, 'data/articles/heritage');

const imagePools = {
  '日本スポーツの転換点': [
    '/images/cbj/display-tags/heritage/jdm-turning-1.jpg',
    '/images/cbj/display-tags/heritage/jdm-turning-2.jpg',
  ],
  '日本名車の系譜': [
    '/images/cbj/display-tags/heritage/japan-lineage-1.jpg',
    '/images/cbj/display-tags/heritage/japan-lineage-2.jpg',
  ],
  'フェラーリの系譜': [
    '/images/cbj/display-tags/heritage/ferrari-lineage-1.jpg',
    '/images/cbj/display-tags/heritage/ferrari-lineage-2.jpg',
  ],
  'スーパーカーの思想': [
    '/images/cbj/display-tags/heritage/supercar-thought-1.jpg',
    '/images/cbj/display-tags/heritage/supercar-thought-2.jpg',
  ],
  'GTと高級車の思想': [
    '/images/cbj/display-tags/heritage/gt-luxury-1.jpg',
    '/images/cbj/display-tags/heritage/gt-luxury-2.jpg',
  ],
  '工学と設計思想': [
    '/images/cbj/display-tags/heritage/engineering-1.jpg',
    '/images/cbj/display-tags/heritage/engineering-2.jpg',
  ],
};

const knownTags = new Set(Object.keys(imagePools));

function normalize(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function resolveTag(item) {
  const explicit = normalize(item.displayTag);
  if (knownTags.has(explicit)) return explicit;
  const haystack = [
    normalize(item.slug),
    normalize(item.title),
    normalize(item.brandName),
    normalize(item.maker),
    ...(Array.isArray(item.tags) ? item.tags : []),
  ].join(' ').toLowerCase();
  if (/ferrari|laferrari|sf90|f40|purosangue|812|550|gtc4|roma|mid-engine|front-engine/.test(haystack)) return 'フェラーリの系譜';
  if (/lamborghini|mclaren|supercar|diablo|temerario|nsx|hypercar/.test(haystack)) return 'スーパーカーの思想';
  if (/w140|s-class|celsior|ls400|lexus|flagship|luxury|silence|precision/.test(haystack)) return 'GTと高級車の思想';
  if (/engineering|parts-bin|fd3s|rx-7|rotary|software-performance/.test(haystack)) return '工学と設計思想';
  if (/skyline|fairlady|hakosuka|roadster|miata|ae86|integra|type-r/.test(haystack)) return '日本名車の系譜';
  return '日本スポーツの転換点';
}

function stableIndex(seed, size) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % size;
}

function pickPoolImages(item) {
  const tag = resolveTag(item);
  const pool = imagePools[tag] || imagePools['日本スポーツの転換点'];
  const start = stableIndex(item.slug || item.title || tag, pool.length);
  return [...pool.slice(start), ...pool.slice(0, start)];
}

function cleanLine(line) {
  return String(line || '')
    .replace(/__SPEC_HEADING__/g, '')
    .replace(/^[-*・]\s*/, '')
    .replace(/^>\s*/, '')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .trim();
}

function slugify(input) {
  return String(input || 'section')
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'section';
}

function parseSections(body) {
  const lines = String(body || '').split(/\r?\n/);
  const out = [];
  let current = null;
  const push = () => {
    if (!current) return;
    current.body = current.body.map(cleanLine).filter(Boolean);
    if (current.title && current.body.length) out.push(current);
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      push();
      const title = cleanLine(heading[2]);
      current = { id: slugify(title), title, level: heading[1].length, body: [] };
      continue;
    }
    const cleaned = cleanLine(line);
    if (!cleaned) continue;
    if (!current) current = { id: 'story', title: 'Story', level: 2, body: [] };
    current.body.push(cleaned);
  }
  push();
  return out;
}

function firstSentence(text) {
  const match = String(text || '').match(/^(.+?。)/);
  return (match ? match[1] : String(text || '')).trim();
}

function bodyWithoutFirst(section) {
  const body = section.body || [];
  if (body.length <= 1) return '';
  return body.slice(1).join('\n');
}

function compactTitle(text, fallback) {
  const cleaned = String(text || fallback || '')
    .replace(/[。.!！？]+$/g, '')
    .trim();
  return cleaned.length > 34 ? `${cleaned.slice(0, 34)}…` : cleaned;
}

function detectCode(title, index) {
  const text = String(title || '');
  const patterns = [
    /\b(RZ34|Z34|Z33|Z32|Z31|S30|R35|R34|R33|R32|KPGC10|KPGC110)\b/i,
    /\b(DC5|DC2|NA1|NA2|FD3S|AE86|W140|LS400|F40|F1|NSX|S2000|LFA|GR)\b/i,
    /\b(308|328|348|360|458|488|550|599|812|SF90|Roma|Purosangue|Diablo|Temerario)\b/i,
    /(280ps|280馬力)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].toUpperCase();
  }
  return String(index + 1).padStart(2, '0');
}

function detectYears(section, item, index) {
  const candidates = [section.title, ...(section.body || []).slice(0, 2), item.eraLabel, item.years].filter(Boolean).join(' ');
  const range = candidates.match(/(19\d{2}|20\d{2})\s*[–—-]\s*(19\d{2}|20\d{2}|現在|present|)/i);
  if (range) return range[0].replace(/\s+/g, '').replace(/—/g, '-').replace(/–/g, '-');
  const year = candidates.match(/(19\d{2}|20\d{2})/);
  if (year) return year[1];
  const era = normalize(item.eraLabel);
  if (era && index === 0) return era.replace(/–/g, '-');
  return String(index + 1).padStart(2, '0');
}

function makeDnaCards(section) {
  const bodies = (section.body || []).slice(0, 4);
  return bodies.map((text, index) => ({
    number: String(index + 1).padStart(2, '0'),
    title: compactTitle(firstSentence(text), section.title),
    text,
  }));
}

function shouldBeMist(section) {
  return /DNA|遺伝子|設計|思想|基準|価値|哲学|意味|条件|理由|変えた|残した/.test(section.title);
}

function shouldBeDark(section, index) {
  return index % 4 === 1 || /GT|ターボ|V12|V8|スーパーカー|戦|革命|転換|復活|速さ|レース|モータースポーツ|サーキット/.test(section.title);
}

function makeClosing(item) {
  const summary = normalize(item.summary || item.heroCaption || item.subtitle || item.lead);
  if (summary) {
    const line = firstSentence(summary).replace(/[。]+$/g, '。');
    return [compactTitle(item.heroTitle || item.title, item.title), line, 'CAR BOUTIQUE JOURNAL'];
  }
  return [compactTitle(item.heroTitle || item.title, item.title), 'その背景を、次の選択へつなげる。', 'CAR BOUTIQUE JOURNAL'];
}

function makeGuideCards(item) {
  const highlights = Array.isArray(item.highlights) ? item.highlights.filter(Boolean) : [];
  const source = highlights.length ? highlights : [item.summary, item.heroCaption].filter(Boolean);
  return source.slice(0, 4).map((text, index) => ({
    badge: index === 0 ? '必読' : index === 1 ? '重要' : '確認',
    title: compactTitle(firstSentence(text), `視点 ${index + 1}`),
    text: String(text).trim(),
    tone: index === 0 ? 'gold' : 'paper',
  }));
}

function buildCinematic(item) {
  const sections = parseSections(item.body || '');
  const pool = pickPoolImages(item);
  const heroImage = normalize(item.heroImage || item.thumbnail || item.ogImageUrl) || pool[0];
  const timelineSections = sections.slice(0, 6);
  const chapterSections = sections.slice(6);

  const generations = timelineSections.map((section, index) => ({
    code: detectCode(section.title, index),
    years: detectYears(section, item, index),
    name: compactTitle(section.title, `Chapter ${index + 1}`),
    title: compactTitle(firstSentence(section.body[0] || section.title), section.title),
    lead: section.body[0] || normalize(item.summary || item.heroCaption || ''),
    body: bodyWithoutFirst(section),
    image: pool[index % pool.length] || heroImage,
  }));

  const chapters = chapterSections.map((section, index) => {
    const theme = shouldBeMist(section) && section.body.length >= 2 ? 'mist' : shouldBeDark(section, index) ? 'dark' : 'paper';
    const chapter = {
      id: section.id || `chapter-${index + 1}`,
      kicker: index === 0 ? 'TURNING POINT / 01' : `CHAPTER / ${String(index + 2).padStart(2, '0')}`,
      title: compactTitle(section.title, `Chapter ${index + 2}`),
      subtitle: firstSentence(section.body[0] || ''),
      body: section.body,
      image: pool[(index + timelineSections.length) % pool.length] || heroImage,
      theme,
    };
    if (theme === 'mist') chapter.cards = makeDnaCards(section);
    return chapter;
  });

  const generatedGuideCards = makeGuideCards(item);
  return {
    eyebrow: 'HERITAGE / 系譜',
    title: normalize(item.heroTitle) || compactTitle(item.title, item.slug),
    subtitle: normalize(item.heroCaption || item.summary || item.lead) || '歴史と技術の流れを、ひとつの系譜として読む。',
    heroImage,
    timelineTitle: item.eraLabel ? `${item.eraLabel}の流れ` : '背景と流れ',
    timelineLead: normalize(item.summary || item.heroCaption || item.lead) || '時代の変化を追いながら、その車が何を残したのかを読む。',
    generations,
    chapters,
    guideLabel: 'READING GUIDE',
    guideTitle: '読み方のポイント',
    guideLead: 'この記事を読む前に押さえておきたい視点を整理する。',
    guideCards: generatedGuideCards,
    closing: makeClosing(item),
    showFinalNav: false,
    showRelated: false,
  };
}

const files = fs.readdirSync(heritageDir).filter((name) => name.endsWith('.json')).sort();
let changed = 0;
for (const name of files) {
  const file = path.join(heritageDir, name);
  const item = JSON.parse(fs.readFileSync(file, 'utf8'));
  const existing = item.cinematicHeritage && typeof item.cinematicHeritage === 'object' ? item.cinematicHeritage : null;
  if (item.slug === 'nissan-fairlady-z-lineage-heritage' && existing) {
    item.cinematicHeritage = {
      ...existing,
      guideLabel: existing.guideLabel || 'USED GUIDE',
      showFinalNav: false,
      showRelated: false,
    };
  } else {
    item.cinematicHeritage = buildCinematic(item);
  }
  fs.writeFileSync(file, `${JSON.stringify(item, null, 2)}\n`);
  changed += 1;
}

console.log(`Structured cinematicHeritage for ${changed} heritage files.`);
