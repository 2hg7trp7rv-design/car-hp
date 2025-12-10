// lib/repository/cars-repository.ts

/**
 * CARS DataSource層
 *
 * 役割(このモジュールがやること)
 * - data/cars.jsonを読み込み「生の車レコード配列」として公開する
 * - JSONの物理配置(ファイル名や分割方法)をここにカプセル化する
 * - 上位層(lib/cars.tsなど)はこのモジュール経由でのみ車データにアクセスする
 *
 * 非役割(このモジュールがやらないこと)
 * - UI都合のフィルターやソート
 * - displayNameなどの派生値の生成
 * - URLパスやページングなどプレゼンテーション層に近い処理
 *
 * 将来の拡張指針
 * - cars.jsonをブランド別や年代別に分割した場合も
 *   → importするファイルをここに追加し「統合配列」として上位に返す
 * - CarItemの正規化や型変換はlib/cars.ts側で行い
 *   この層はあくまで「JSONそのものの形」を責務とする
 */

import carsJson from "@/data/cars.json";

// ---- 型定義 ----

/**
 * data/cars.json全体の型
 */
export type CarsJson = typeof carsJson;

/**
 * 生の1件分レコード
 * (JSONのフィールドそのままを表す)
 */
export type CarRecord = CarsJson[number];

/**
 * よく使うキーを型として抜き出しておくと
 * 上位層で誤字を防ぎやすい
 */
export type CarId = CarRecord["id"];
export type CarSlug = CarRecord["slug"];
export type CarMaker = CarRecord["maker"];
export type CarBodyType = CarRecord["bodyType"];
export type CarSegment = CarRecord["segment"];

// ---- 内部データ統合レイヤー ----

/**
 * 物理ファイルを統合した「生データ配列」。
 *
 * 将来 cars1.json cars2.json のように分割する場合は
 * ここにだけファイルを追加していけばよい。
 *
 * 例:
 *   import cars1 from "@/data/cars1.json";
 *   const RAW_CARS: CarRecord[] = [
 *     ...carsJson,
 *     ...cars1,
 *   ];
 */
const RAW_CARS: CarRecord[] = [...(carsJson as CarRecord[])];

// ---- 公開API: 生データアクセス ----

/**
 * 生の車データを全件返す。
 * ここでは整形・ソート・フィルタは一切しない。
 *
 * 上位層では「変更不可配列」として扱いたいので
 * 呼び出し側で配列を直接変更しない前提とする。
 * (変更したい場合はスプレッドでコピーしてから操作する)
 */
export function findAllCars(): CarRecord[] {
  return RAW_CARS;
}

/**
 * slugから1件取得する。
 * 見つからなければundefinedを返す。
 */
export function findCarBySlug(slug: CarSlug): CarRecord | undefined {
  return RAW_CARS.find((car) => car.slug === slug);
}

/**
 * idから1件取得する。
 * 見つからなければundefinedを返す。
 */
export function findCarById(id: CarId): CarRecord | undefined {
  return RAW_CARS.find((car) => car.id === id);
}

/**
 * makerでざっくり絞り込む。
 * (BMWなどブランド単位の一覧を作りたいときの土台)
 */
export function findCarsByMaker(maker: CarMaker): CarRecord[] {
  return RAW_CARS.filter((car) => car.maker === maker);
}

/**
 * bodyTypeで絞り込む。
 * (SUVやセダンなどボディタイプ別の下層生成用)
 */
export function findCarsByBodyType(bodyType: CarBodyType): CarRecord[] {
  return RAW_CARS.filter((car) => car.bodyType === bodyType);
}

/**
 * segmentで絞り込む。
 * (Cセグメント Dセグメントなどのクラス別)
 */
export function findCarsBySegment(segment: CarSegment): CarRecord[] {
  return RAW_CARS.filter((car) => car.segment === segment);
}

/**
 * 総件数を返す。
 * UIのインデックス表示(CARS: 120 modelsなど)用。
 */
export function getCarsCount(): number {
  return RAW_CARS.length;
}

// ---- 公開API: 軽いメタ情報 ----

/**
 * 登録されているメーカー一覧(重複排除済み)。
 * 表示順はアルファベット順。
 */
export function listAllMakers(): CarMaker[] {
  const set = new Set<CarMaker>();
  for (const car of RAW_CARS) {
    if (car.maker) set.add(car.maker);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * 登録されているボディタイプ一覧(重複排除済み)。
 */
export function listAllBodyTypes(): CarBodyType[] {
  const set = new Set<CarBodyType>();
  for (const car of RAW_CARS) {
    if (car.bodyType) set.add(car.bodyType);
  }
  return Array.from(set);
}

/**
 * 登録されているセグメント一覧(重複排除済み)。
 */
export function listAllSegments(): CarSegment[] {
  const set = new Set<CarSegment>();
  for (const car of RAW_CARS) {
    if (car.segment) set.add(car.segment);
  }
  return Array.from(set);
}

/**
 * 指定したmakerに紐づくbodyType一覧(重複排除無し)。
 * 将来的にセレクトボックスの依存関係などで使える。
 */
export function listBodyTypesByMaker(maker: CarMaker): CarBodyType[] {
  const set = new Set<CarBodyType>();
  for (const car of RAW_CARS) {
    if (car.maker === maker && car.bodyType) {
      set.add(car.bodyType);
    }
  }
  return Array.from(set);
}

/**
 * 指定したmakerに紐づくsegment一覧(重複排除済み)。
 */
export function listSegmentsByMaker(maker: CarMaker): CarSegment[] {
  const set = new Set<CarSegment>();
  for (const car of RAW_CARS) {
    if (car.maker === maker && car.segment) {
      set.add(car.segment);
    }
  }
  return Array.from(set);
}

// ---- 今後のためのメモ ----
/*
将来やりたいことの候補(ここにメモだけ置いておく)

- 物理ファイル分割:
  - data/cars-eu.json data/cars-jp.jsonなどに分けた場合も
    このモジュールだけを触ればOKな設計を維持する
- 軽いバリデーション:
  - 実運用でレコードが増えてきたら
    起動時にid slug makerなどの重複チェックを行い
    コンソールに警告を出す仕組みを追加してもよい
- 別データソース:
  - 将来的に外部APIやHeadless CMSへ切り替える場合でも
    lib/cars.tsやページ側から見たインターフェースを変えないよう
    このモジュールの中身だけ
