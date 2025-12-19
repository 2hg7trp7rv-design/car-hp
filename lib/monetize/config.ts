// lib/monetize/config.ts
export type MonetizeKey = 
  | 'car_search_conditions' // 中古車: 条件検索
  | 'car_search_price'      // 中古車: 相場価格
  | 'loan_estimate'         // ローン: 月々目安
  | 'loan_precheck'         // ローン: 審査確認
  | 'sell_price_check'      // 売却: 相場把握
  | 'sell_prepare'          // 売却: 準備
  | 'ins_compare';          // 保険: 見積もり

export interface MonetizeConfig {
  key: MonetizeKey;
  url: string;
  label: string;
  description?: string;
}

// 仕様書 4.4.2 に基づくコピー辞書
export const MONETIZE_CONFIG: Record<MonetizeKey, MonetizeConfig> = {
  car_search_conditions: {
    key: 'car_search_conditions',
    url: 'https://example.com/search', // ※本番リンクに置換必須
    label: '条件で在庫を見てみる',
    description: '希望の条件で探す'
  },
  car_search_price: {
    key: 'car_search_price',
    url: 'https://example.com/price',
    label: '相場感を掴む（価格帯を見る）',
    description: '現在の市場価格を確認'
  },
  loan_estimate: {
    key: 'loan_estimate',
    url: 'https://example.com/loan',
    label: '月々の目安を出す',
    description: '無理のない返済計画'
  },
  loan_precheck: {
    key: 'loan_precheck',
    url: 'https://example.com/loan-check',
    label: '通りやすい条件を確認する',
    description: '事前審査シミュレーション'
  },
  sell_price_check: {
    key: 'sell_price_check',
    url: 'https://example.com/sell',
    label: '相場を把握する',
    description: '愛車の概算価格をチェック'
  },
  sell_prepare: {
    key: 'sell_prepare',
    url: 'https://example.com/sell-guide',
    label: '損しない準備を確認する',
    description: '査定前の重要チェック'
  },
  ins_compare: {
    key: 'ins_compare',
    url: 'https://example.com/insurance',
    label: '条件を揃えて見直す',
    description: '維持費の最適化'
  },
};

export const getMonetizeConfig = (key: MonetizeKey): MonetizeConfig => {
  return MONETIZE_CONFIG[key];
};
