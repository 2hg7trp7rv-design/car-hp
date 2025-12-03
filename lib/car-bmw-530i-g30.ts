// lib/car-bmw-530i-g30.ts
//
// BMW 530i (G30) 向けの「マシマシ車種テンプレ」専用ヘルパー。
// 既存の CarItem をベースに、G30 だけ追加のブロックを持てるように拡張しています。

import type { CarItem } from "@/lib/cars";
import g30Json from "@/data/car-bmw-530i-g30.json";

/**
 * G30 専用：使い方シーンごとの印象ブロック
 * （街乗り / 高速 / 長距離 / 維持費）
 */
export interface G30UsageImpressionBlock {
  title: string;
  summary: string;
  pros: string[];
  cons: string[];
}

export interface G30UsageImpressions {
  city?: G30UsageImpressionBlock;
  highway?: G30UsageImpressionBlock;
  longTrip?: G30UsageImpressionBlock;
  maintenance?: G30UsageImpressionBlock;
}

/**
 * G30 専用：トラブル詳細＋費用感
 */
export interface G30TroubleDetail {
  title: string;
  symptoms?: string;
  when?: string;
  cost?: string;
  note?: string;
}

/**
 * G30 専用：維持費シミュレーション
 */
export interface G30MaintenanceSimulationItem {
  label: string;
  // 「〜円 / 年」など、人間向けの説明文字列
  perYear?: string;
  per2Years?: string;
  per3Years?: string;
  memo?: string;
}

export interface G30MaintenanceSimulation {
  note?: string;
  yearlyRoughTotal?: string;
  items: {
    tax: G30MaintenanceSimulationItem;
    insurance: G30MaintenanceSimulationItem;
    shaken: G30MaintenanceSimulationItem;
    tires: G30MaintenanceSimulationItem;
    brakes: G30MaintenanceSimulationItem;
    routine: G30MaintenanceSimulationItem;
  };
}

/**
 * G30 専用テンプレ Car 型
 * - ベースは CarItem（04_data-models-types）
 * - そこに G30 のみが持つ追加フィールドを足したもの
 */
export interface G30CarTemplate extends CarItem {
  usageImpressions?: G30UsageImpressions;
  troubleDetails?: G30TroubleDetail[];
  maintenanceSimulation?: G30MaintenanceSimulation;
}

// JSON から読み込んだ生データを型付け
const g30Data = g30Json as G30CarTemplate[];

/**
 * 現状は 1 件だけだが、配列前提で定義。
 * 将来 G30 の別グレードを増やしてもこのまま使える。
 */
export function getAllG30Templates(): G30CarTemplate[] {
  return g30Data;
}

/**
 * slug から G30 テンプレを取得
 * - /cars/bmw-530i-g30 向け
 * - 将来 G30 のバリエーションが増えても流用可能
 */
export function getG30TemplateBySlug(slug: string): G30CarTemplate | null {
  const hit = g30Data.find((item) => item.slug === slug);
  return hit ?? null;
}

/**
 * BMW 530i (G30) 向けの“メイン”テンプレを 1 件だけ返すユーティリティ。
 * - 今のところは 0 番目をそのまま返す運用。
 * - 将来バリエーションが増えたら、この関数側で選択ロジックを入れる想定。
 */
export function getPrimaryG30Template(): G30CarTemplate | null {
  if (g30Data.length === 0) return null;
  return g30Data[0];
}
