import { C } from "./palette";

/** 燃料計の三角（◀）と、クルマの左側にある給油口の対応。スマホでも読めるよう縦長に描く。 */
export function FuelGauge() {
  return (
    <svg viewBox="0 0 480 620" role="img" aria-label="燃料計の給油機マークの横にある三角が左向きなら、給油口はクルマの左側にある">
      <defs>
        <marker id="fg-arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 Z" fill={C.coral} />
        </marker>
      </defs>

      {/* メーター */}
      <text x="240" y="38" textAnchor="middle" fontSize="26" fontWeight="800" fill={C.ink}>メーターの燃料計</text>
      <rect x="40" y="56" width="400" height="224" rx="32" fill={C.ink} />
      <path d="M124 200 A116 116 0 0 1 356 200" fill="none" stroke={C.inkSoft} strokeWidth="18" strokeLinecap="round" />
      <path d="M124 200 A116 116 0 0 1 166 114" fill="none" stroke={C.sun} strokeWidth="18" strokeLinecap="round" />
      <text x="108" y="246" textAnchor="middle" fontSize="28" fontWeight="800" fill={C.paper}>E</text>
      <text x="372" y="246" textAnchor="middle" fontSize="28" fontWeight="800" fill={C.paper}>F</text>
      <line x1="240" y1="200" x2="176" y2="126" stroke={C.coral} strokeWidth="8" strokeLinecap="round" />
      <circle cx="240" cy="200" r="13" fill={C.paper} />
      {/* 給油機マークと三角 */}
      <g transform="translate(250 256) scale(1.4)">
        <rect x="-4" y="-16" width="20" height="26" rx="3" fill={C.paper} />
        <rect x="0" y="-12" width="12" height="8" rx="1.5" fill={C.ink} />
        <path d="M16 -10 h6 v14 a3 3 0 0 0 6 0 v-10" fill="none" stroke={C.paper} strokeWidth="3" strokeLinecap="round" />
        <polygon points="-14,-12 -14,6 -30,-3" fill={C.sun} />
        <circle cx="-21" cy="-3" r="19" fill="none" stroke={C.coral} strokeWidth="3.5" />
      </g>

      {/* 結論 */}
      <rect x="56" y="300" width="368" height="72" rx="20" fill={C.paper} stroke={C.ink} strokeWidth="3" />
      <text x="240" y="346" textAnchor="middle" fontSize="27" fontWeight="800" fill={C.ink}>
        三角が左なら、<tspan fill={C.coral}>給油口も左</tspan>
      </text>

      {/* クルマを上から見た図 */}
      <text x="240" y="406" textAnchor="middle" fontSize="20" fontWeight="800" fill={C.inkSoft}>▲ 前（上から見た図）</text>
      <g transform="translate(188 420)">
        <rect x="0" y="0" width="104" height="184" rx="36" fill={C.sky} stroke={C.ink} strokeWidth="4" />
        <path d="M14 50 Q52 30 90 50 L85 76 Q52 66 19 76 Z" fill={C.paper} stroke={C.ink} strokeWidth="3" />
        <rect x="18" y="84" width="68" height="50" rx="12" fill="#2C8BD0" stroke={C.ink} strokeWidth="3" />
        <path d="M21 144 Q52 152 83 144 L86 162 Q52 170 18 162 Z" fill={C.paper} stroke={C.ink} strokeWidth="3" />
        <rect x="-7" y="108" width="14" height="28" rx="4" fill={C.sun} stroke={C.ink} strokeWidth="3" />
        <circle cx="0" cy="122" r="24" fill="none" stroke={C.coral} strokeWidth="4" />
      </g>
      <text x="96" y="560" textAnchor="middle" fontSize="24" fontWeight="800" fill={C.coral}>給油口</text>
      <path d="M128 552 Q160 548 168 554" fill="none" stroke={C.coral} strokeWidth="3.5" strokeLinecap="round" markerEnd="url(#fg-arrow)" />
    </svg>
  );
}
