import { C } from "./palette";

const NOZZLES = [
  { label: "レギュラー", color: C.coral, text: C.paper },
  { label: "ハイオク", color: C.sun, text: C.ink },
  { label: "軽油", color: C.mint, text: C.ink },
] as const;

function Nozzle({ color }: { color: string }) {
  return (
    <g>
      <path d="M78 0 C78 24 70 34 70 52" fill="none" stroke={C.ink} strokeWidth="10" strokeLinecap="round" />
      <path d="M78 0 C78 24 70 34 70 52" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <rect x="40" y="50" width="78" height="44" rx="16" fill={color} stroke={C.ink} strokeWidth="4" />
      <rect x="74" y="84" width="38" height="96" rx="16" fill={color} stroke={C.ink} strokeWidth="4" />
      <path d="M52 94 Q58 128 76 132" fill="none" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
      <rect x="-14" y="60" width="62" height="16" rx="8" fill={C.gray} stroke={C.ink} strokeWidth="4" transform="rotate(14 48 68)" />
    </g>
  );
}

/** 給油ノズルの色の目安。色は目印で、最後は文字の表示で確かめる。 */
export function NozzleColors() {
  return (
    <svg viewBox="0 0 480 330" role="img" aria-label="給油ノズルの色の目安。赤はレギュラー、黄色はハイオク、緑は軽油。色だけでなく文字の表示も確認する">
      {NOZZLES.map((n, i) => {
        const x = 15 + i * 155;
        return (
          <g key={n.label} transform={`translate(${x} 10)`}>
            <rect x="0" y="0" width="140" height="232" rx="22" fill={C.paper} stroke={C.ink} strokeWidth="3" />
            <g transform="translate(24 16) scale(0.78)">
              <Nozzle color={n.color} />
            </g>
            <rect x="10" y="176" width="120" height="42" rx="21" fill={n.color} stroke={C.ink} strokeWidth="3" />
            <text x="70" y="205" textAnchor="middle" fontSize={n.label.length > 3 ? 20 : 22} fontWeight="800" fill={n.text}>{n.label}</text>
          </g>
        );
      })}
      <rect x="15" y="262" width="450" height="56" rx="28" fill={C.cream} stroke={C.ink} strokeWidth="3" />
      <text x="240" y="298" textAnchor="middle" fontSize="22" fontWeight="800" fill={C.ink}>色は目印。最後は「文字」で確かめよう</text>
    </svg>
  );
}
