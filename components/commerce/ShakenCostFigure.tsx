import styles from "@/app/choose/choose.module.css";

const FIXED = [
  { label: "自賠責保険料", height: 46 },
  { label: "自動車重量税", height: 54 },
  { label: "検査手数料", height: 30 },
];
const VARIABLE = [
  { label: "点検・整備の作業", height: 62 },
  { label: "交換した部品", height: 54 },
  { label: "代行手数料", height: 38 },
];

/** Which part of an inspection quote moves between shops, and which part does not. */
export function ShakenCostFigure() {
  const column = (items: typeof FIXED, x: number, fill: string, stroke: string) => {
    let y = 74;
    return items.map((item) => {
      const top = y;
      y += item.height + 4;
      return (
        <g key={item.label}>
          <rect x={x} y={top} width="150" height={item.height} rx="8" fill={fill} stroke={stroke} strokeWidth="2" />
          <text x={x + 75} y={top + item.height / 2 + 6} textAnchor="middle" className={styles.svgSmall}>
            {item.label}
          </text>
        </g>
      );
    });
  };
  return (
    <svg
      viewBox="0 0 600 330"
      role="img"
      aria-label="車検で払うお金は、車の条件で決まる法定費用と、受け先で変わる整備や代行の費用に分かれる。見積もりを比べるときに差が出るのは後者であることを示す図。"
    >
      <rect x="20" y="30" width="250" height="250" rx="16" fill="#f4f7f8" />
      <rect x="330" y="30" width="250" height="250" rx="16" fill="#fff6ee" />
      <text x="145" y="60" textAnchor="middle">法定費用</text>
      <text x="455" y="60" textAnchor="middle">整備・代行の費用</text>
      {column(FIXED, 70, "#e3edf1", "#5f8496")}
      {column(VARIABLE, 380, "#ffe6d2", "#c9743c")}
      <text x="145" y="264" textAnchor="middle" className={styles.svgSmall}>
        車の条件で決まる
      </text>
      <text x="455" y="264" textAnchor="middle" className={styles.svgSmall}>
        受け先と整備内容で変わる
      </text>
      <text x="300" y="310" textAnchor="middle" className={styles.svgSmall}>
        見積もりを比べるときに差が出るのは、右側
      </text>
    </svg>
  );
}
