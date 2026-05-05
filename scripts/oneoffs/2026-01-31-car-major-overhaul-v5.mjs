import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const carsDir = path.join(repoRoot, "data", "articles", "cars");

const appendMap = {
  "mercedes-benz-s-class-w140":
    " 購入前に全スイッチの動作を一通り確認し、直すべき点を見積もった上で買うと、長く穏やかに乗れます。主治医が決まるだけで、選択肢が整理できます。",
  "suzuki-alto-works-ha36s":
    " 車重が軽い分、足回りの状態が走りに直結します。車高やアライメントが極端な個体は避け、用途に合う駆動方式を選ぶと失敗しにくいです。",
  "suzuki-cappuccino-ea11r": " 錆の少ないボディを選べれば、機関の整備は後から追いつきます。",
  "honda-beat-pp1": " 内装や小物が揃っている車は、扱われ方も丁寧なことが多いです。",
  "mitsubishi-lancer-evolution-vi-gsr": " まずは素直に走る基礎を作るのが近道です。",
  "nissan-skyline-gtr-r34": " 写真より現車の細部で差が出ます。",
  "toyota-supra-jza80-rz": " 方向性の揃った個体を狙うと楽です。",
  "subaru-impreza-wrx-sti-gc8-type-r": " 整備体制まで含めて選びたい。",
  "nissan-silvia-s15": " 骨格の綺麗さが最優先。",
  "autozam-az-1-pg6sa": " 欠品の有無で難易度が変わります。",
};

let changed = 0;
for (const [slug, suffix] of Object.entries(appendMap)) {
  const file = path.join(carsDir, `${slug}.json`);
  const raw = fs.readFileSync(file, "utf8");
  const car = JSON.parse(raw);
  const base = String(car.summaryLong ?? "").trim();
  car.summaryLong = (base + suffix).trim();
  fs.writeFileSync(file, JSON.stringify(car, null, 2) + "\n");
  changed++;
}

console.log("v5 summaryLong append applied:", changed);
