import { useId } from "react";

const BARS = [34, 48, 40, 62, 52, 74, 66];

/** Pink vertical light streaks that sit behind each dashboard mock-up. */
function Streaks({ id }) {
  const rects = [[18, 26, 120], [78, 14, 160], [292, 34, 150], [338, 14, 110], [236, 12, 90]];
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={id + "s"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EC5FAE" stopOpacity="0" />
          <stop offset=".55" stopColor="#EC5FAE" stopOpacity=".34" />
          <stop offset="1" stopColor="#EC5FAE" stopOpacity="0" />
        </linearGradient>
      </defs>
      {rects.map(([x, w, h], i) => (
        <rect key={x} x={x} y={i % 2 ? 6 : 0} width={w} height={210 - (i % 2 ? 6 : 0)} rx={w / 2} fill={`url(#${id}s)`} opacity={0.5 + (i % 3) * 0.2} />
      ))}
    </g>
  );
}

function Frame({ id, label, children }) {
  return (
    <svg viewBox="0 0 360 210" role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={id + "g"} x1="0" x2="1"><stop offset="0" stopColor="#42116F" /><stop offset="1" stopColor="#EC5FAE" /></linearGradient>
        <linearGradient id={id + "a"} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9B4DA8" stopOpacity=".35" /><stop offset="1" stopColor="#9B4DA8" stopOpacity="0" /></linearGradient>
      </defs>
      <Streaks id={id} />
      <rect x="46" y="30" width="276" height="170" rx="14" fill="#42116F" opacity=".12" />
      <rect x="40" y="22" width="276" height="170" rx="14" fill="var(--paper)" stroke="var(--line)" />
      <circle cx="56" cy="38" r="3.2" fill="#EC5FAE" /><circle cx="67" cy="38" r="3.2" fill="#C78BDA" /><circle cx="78" cy="38" r="3.2" fill="#9B4DA8" />
      <rect x="226" y="34" width="74" height="8" rx="4" fill="var(--mist)" />
      {children}
    </svg>
  );
}

const Label = ({ x, y, children }) => (
  <text x={x} y={y} fontSize="8.5" fontWeight="600" fill="var(--muted)" fontFamily="inherit">{children}</text>
);

/** Patient analytics dashboard: KPI tiles, bar + line chart, heartbeat line. */
export function HealthArt() {
  const id = useId().replace(/:/g, "");
  const line = BARS.map((v, i) => `${i ? "L" : "M"}${72 + i * 34} ${170 - v * 0.9 - 8}`).join(" ");
  return (
    <Frame id={id} label="Patient analytics dashboard with KPI tiles, a bar and line chart and a heartbeat line">
      {[["Patients", 54], ["Care gaps", 134]].map(([t, x]) => (
        <g key={t}>
          <rect x={x} y="52" width="72" height="42" rx="9" fill="var(--mist)" />
          <Label x={x + 9} y="68">{t}</Label>
          <rect x={x + 9} y="76" width="34" height="8" rx="4" fill={`url(#${id}g)`} />
        </g>
      ))}
      <rect x="214" y="52" width="92" height="42" rx="9" fill="var(--mist)" />
      <path d="M222 74 H244 L250 62 L258 86 L265 68 L269 74 H298" fill="none" stroke={`url(#${id}g)`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="54" y="102" width="252" height="80" rx="9" fill="var(--mist)" />
      {BARS.map((v, i) => (
        <rect key={i} x={64 + i * 34} y={172 - v * 0.9} width="14" height={v * 0.9} rx="4" fill={`url(#${id}g)`} opacity={0.35 + i * 0.09} />
      ))}
      <path d={line} fill="none" stroke="#42116F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {BARS.map((v, i) => <circle key={i} cx={72 + i * 34} cy={170 - v * 0.9 - 8} r="2.8" fill="var(--paper)" stroke="#42116F" strokeWidth="1.6" />)}
    </Frame>
  );
}

/** Viewership / streaming dashboard: trend chart, donut, audience segment bars. */
export function CmeArt() {
  const id = useId().replace(/:/g, "");
  const trend = "M62 150 C 84 146, 96 120, 118 124 S 152 150, 176 112 S 204 96, 228 106";
  const segs = [["Live", 70], ["VOD", 52], ["Mobile", 36]];
  return (
    <Frame id={id} label="Viewership dashboard with a trend chart, a donut and audience segment bars">
      <rect x="54" y="52" width="150" height="130" rx="9" fill="var(--mist)" />
      <Label x="64" y="68">Viewership</Label>
      <path d={`${trend} L228 172 L62 172 Z`} fill={`url(#${id}a)`} />
      <path d={trend} fill="none" stroke={`url(#${id}g)`} strokeWidth="3" strokeLinecap="round" />
      <circle cx="176" cy="112" r="4" fill="var(--paper)" stroke="#EC5FAE" strokeWidth="2" />
      <rect x="214" y="52" width="92" height="62" rx="9" fill="var(--mist)" />
      <circle cx="260" cy="83" r="17" fill="none" stroke="var(--line)" strokeWidth="8" />
      <circle cx="260" cy="83" r="17" fill="none" stroke={`url(#${id}g)`} strokeWidth="8" strokeDasharray="70 107" strokeLinecap="round" transform="rotate(-90 260 83)" />
      <rect x="214" y="122" width="92" height="60" rx="9" fill="var(--mist)" />
      {segs.map(([t, w], i) => (
        <g key={t}>
          <Label x="222" y={138 + i * 17}>{t}</Label>
          <rect x="256" y={131 + i * 17} width="42" height="7" rx="3.5" fill="var(--line)" />
          <rect x="256" y={131 + i * 17} width={w * 0.6} height="7" rx="3.5" fill={`url(#${id}g)`} />
        </g>
      ))}
    </Frame>
  );
}

export const INDUSTRY_ART = { health: HealthArt, cme: CmeArt };
