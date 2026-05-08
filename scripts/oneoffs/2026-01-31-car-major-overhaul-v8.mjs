import fs from "fs";
import path from "path";

const repoRoot = process.cwd();
const carsDir = path.join(repoRoot, "data", "articles", "cars");

const appendMap = {
  "mercedes-benz-s-class-w140":
    " 街乗りより、一定速度で流すほど良さが出ます。",
  "suzuki-alto-works-ha36s":
    " 基礎が整うと、運転の気持ち良さが一気に上がります。",
};

let touched = 0;
for (const [slug, extra] of Object.entries(appendMap)) {
  const file = path.join(carsDir, `${slug}.json`);
  const car = JSON.parse(fs.readFileSync(file, "utf8"));
  car.summaryLong = `${String(car.summaryLong || "").trim()}${extra}`;
  fs.writeFileSync(file, `${JSON.stringify(car, null, 2)}\n`, "utf8");
  touched += 1;
}

console.log(`v8 summaryLong append applied: ${touched}`);
