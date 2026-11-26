// Custom illustrations for the capability cards (src/components/CapabilityRail.jsx). Pure inline SVG, no images to load.
// Each scene is drawn in the middle (280 x 176) of a wider 440 x 176 backdrop in navy / purple / blue with soft neon lines. The scene is picked by the
// card's `art` key (src/services.js); the card text stays real HTML next to it.

const CY = "#5EE7FF", PU = "#C4A1FF", BL = "#6EA8FF", PK = "#F0ABFC", W = "#FFFFFF";
const SOFT = "rgba(255,255,255,.1)", EDGE = "rgba(255,255,255,.28)";

/** Backdrop colours (from, to), rotated by card position so neighbours differ a little. */
const BACKDROPS = [["#0C1230", "#3A1A78"], ["#0C1230", "#1E3A8A"], ["#14123F", "#5B21B6"], ["#0A1A3F", "#4C1D95"], ["#101A4A", "#6D28D9"], ["#0C1230", "#312E81"]];

const star = (x, y, s) => `M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`;
const CLOUD = "M100 66 H176 a22 22 0 0 0 2 -44 a30 30 0 0 0 -56 -6 a26 26 0 0 0 -22 50 z";
const SHIELD = "M140 32 L186 48 V86 C186 116 166 136 140 148 C114 136 94 116 94 86 V48 Z";

function Roadmap() {
  const d = "M26 142 C78 150 92 96 142 104 S214 56 254 38";
  return (
    <>
      <path d={d} fill="none" stroke="rgba(94,231,255,.28)" strokeWidth="9" strokeLinecap="round" />
      <path d={d} fill="none" stroke={CY} strokeWidth="3" strokeLinecap="round" strokeDasharray="1 8" />
      {[[26, 142], [142, 104], [254, 38]].map(([x, y]) => (
        <g key={x}><circle cx={x} cy={y} r="9" fill="#0C1230" stroke={CY} strokeWidth="2.5" /><circle cx={x} cy={y} r="3" fill={W} /></g>
      ))}
      <path d="M254 38 V10 M254 10 L274 17 L254 25 Z" fill={PK} stroke={PK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="34" y="40" width="70" height="38" rx="9" fill={SOFT} stroke={EDGE} />
      <rect x="44" y="51" width="34" height="5" rx="2.5" fill={PU} /><rect x="44" y="62" width="50" height="5" rx="2.5" fill="rgba(255,255,255,.4)" />
      <g fill="none" stroke={PU} strokeWidth="1.6"><circle cx="228" cy="128" r="22" /><circle cx="228" cy="128" r="13" /><circle cx="228" cy="128" r="4" fill={PU} /></g>
      <path d="M170 36 l10 -14 l10 14 z M178 36 h4 v14 h-4 z" fill="rgba(255,255,255,.22)" />
    </>
  );
}

function Architecture() {
  const layers = [34, 66, 98];
  return (
    <>
      {layers.map((y, i) => (
        <g key={y}>
          <polygon points={`78,${y + 27} 140,${y + 54} 140,${y + 64} 78,${y + 37}`} fill="rgba(20,20,70,.85)" stroke={EDGE} />
          <polygon points={`202,${y + 27} 140,${y + 54} 140,${y + 64} 202,${y + 37}`} fill="rgba(40,20,100,.85)" stroke={EDGE} />
          <polygon points={`140,${y} 202,${y + 27} 140,${y + 54} 78,${y + 27}`} fill={i === 0 ? "rgba(196,161,255,.4)" : "rgba(110,168,255,.25)"} stroke={i === 0 ? PU : CY} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="140" cy={y + 27} r="3.5" fill={W} />
        </g>
      ))}
      <path d="M32 60 H78 M202 90 H250 M32 120 H78" stroke={CY} strokeWidth="1.6" strokeDasharray="3 4" fill="none" />
      {[[26, 60], [256, 90], [26, 120]].map(([x, y]) => <rect key={y} x={x - 8} y={y - 8} width="16" height="16" rx="4" fill="#0C1230" stroke={PU} strokeWidth="2" />)}
    </>
  );
}

function Platform() {
  return (
    <>
      <path d={CLOUD} fill="rgba(110,168,255,.28)" stroke={BL} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M126 44 l8 8 l18 -18" fill="none" stroke={W} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M65 104 V86 H215 V104 M140 66 V86" fill="none" stroke="rgba(94,231,255,.55)" strokeWidth="1.6" strokeDasharray="3 4" />
      {[36, 111, 186].map((x, i) => (
        <g key={x}>
          <rect x={x} y="104" width="58" height="52" rx="10" fill={i === 1 ? "rgba(94,231,255,.16)" : SOFT} stroke={i === 1 ? CY : EDGE} strokeWidth={i === 1 ? 2.4 : 1.2} />
          {i === 1
            ? <path d="M128 130 l9 9 l17 -19" fill="none" stroke={CY} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            : <><rect x={x + 12} y="120" width="34" height="5" rx="2.5" fill="rgba(255,255,255,.4)" /><rect x={x + 12} y="132" width="22" height="5" rx="2.5" fill="rgba(255,255,255,.25)" /></>}
        </g>
      ))}
    </>
  );
}

function Poc() {
  return (
    <>
      <path d="M88 32 H104 V70 L130 122 Q136 138 120 138 H72 Q56 138 62 122 L88 70 Z" fill="rgba(255,255,255,.07)" stroke={PU} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M69 108 H123 L130 122 Q136 138 120 138 H72 Q56 138 62 122 Z" fill="rgba(196,161,255,.55)" />
      <circle cx="90" cy="118" r="4" fill={W} fillOpacity=".7" /><circle cx="106" cy="104" r="3" fill={W} fillOpacity=".6" /><circle cx="97" cy="56" r="3.5" fill={CY} /><circle cx="108" cy="42" r="2.5" fill={CY} />
      <rect x="150" y="38" width="100" height="84" rx="10" fill={SOFT} stroke={EDGE} />
      {[0, 1, 2, 3].map((k) => <rect key={k} x={164 + k * 20} y={106 - [18, 30, 24, 42][k]} width="12" height={[18, 30, 24, 42][k]} rx="3" fill={k === 3 ? CY : BL} fillOpacity={k === 3 ? 1 : 0.7} />)}
      <path d="M162 70 L186 60 L206 66 L238 48" fill="none" stroke={PK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="248" cy="40" r="12" fill={CY} /><path d="M243 40 l4 4 l7 -8" fill="none" stroke="#0C1230" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function Delivery() {
  const lines = [[76, 50, 50, PU], [88, 62, 74, CY], [88, 74, 42, BL], [76, 86, 64, PK], [88, 98, 58, CY], [76, 110, 36, PU]];
  return (
    <>
      <rect x="62" y="34" width="156" height="98" rx="9" fill="rgba(12,18,48,.8)" stroke={CY} strokeWidth="2.2" />
      <path d="M62 46 H218" stroke="rgba(255,255,255,.18)" />
      <circle cx="73" cy="40" r="2.4" fill={PK} /><circle cx="82" cy="40" r="2.4" fill={PU} /><circle cx="91" cy="40" r="2.4" fill={CY} />
      {lines.map(([x, y, w, c]) => <rect key={y} x={x} y={y + 4} width={w} height="5" rx="2.5" fill={c} fillOpacity=".85" />)}
      <text x="176" y="108" fontFamily="ui-monospace,Consolas,monospace" fontSize="30" fontWeight="700" fill={PU} fillOpacity=".9">{"</>"}</text>
      <path d="M44 132 H236 L224 144 H56 Z" fill="rgba(255,255,255,.14)" stroke={EDGE} strokeLinejoin="round" />
      <circle cx="240" cy="34" r="13" fill="rgba(94,231,255,.2)" stroke={CY} strokeWidth="2" /><path d="M234 34 l4 4 l8 -9" fill="none" stroke={W} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="30" y="56" width="26" height="18" rx="5" fill={SOFT} stroke={EDGE} /><rect x="30" y="82" width="26" height="18" rx="5" fill={SOFT} stroke={EDGE} />
    </>
  );
}

function Support() {
  return (
    <>
      <ellipse cx="140" cy="92" rx="112" ry="30" transform="rotate(-16 140 92)" fill="none" stroke="rgba(196,161,255,.6)" strokeWidth="1.6" strokeDasharray="4 5" />
      <path d={SHIELD} fill="rgba(124,92,255,.28)" stroke={CY} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M120 90 l14 14 l28 -30" fill="none" stroke={W} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="34" cy="118" r="7" fill="#0C1230" stroke={PK} strokeWidth="2.4" /><circle cx="246" cy="64" r="7" fill="#0C1230" stroke={CY} strokeWidth="2.4" />
      <circle cx="232" cy="130" r="14" fill="none" stroke={PU} strokeWidth="6" strokeDasharray="4 3.6" /><circle cx="232" cy="130" r="5" fill={PU} />
      <path d={star(48, 44, 9)} fill={PK} />
    </>
  );
}

function AiChip() {
  const pins = [0, 1, 2, 3];
  return (
    <>
      <circle cx="140" cy="92" r="64" fill="none" stroke="rgba(196,161,255,.35)" strokeWidth="1.4" strokeDasharray="3 6" />
      {pins.map((k) => {
        const p = 118 + k * 14;
        return (
          <g key={k} stroke={CY} strokeWidth="2" strokeLinecap="round">
            <path d={`M${p} 60 V44 M${p} 124 V140 M108 ${60 + 4 + k * 14} H92 M172 ${64 + k * 14} H188`} />
            <circle cx={p} cy="42" r="2.6" fill={CY} /><circle cx={p} cy="142" r="2.6" fill={CY} />
          </g>
        );
      })}
      <rect x="106" y="58" width="68" height="68" rx="13" fill="rgba(124,92,255,.38)" stroke={CY} strokeWidth="2.6" />
      <text x="140" y="103" textAnchor="middle" fontFamily="Plus Jakarta Sans,system-ui,sans-serif" fontSize="28" fontWeight="800" fill={W}>AI</text>
      <path d={star(222, 40, 12)} fill={PK} /><path d={star(58, 134, 9)} fill={CY} /><path d={star(238, 126, 6)} fill={PU} />
    </>
  );
}

function Neural() {
  const layers = [[56, [52, 88, 124]], [116, [34, 68, 108, 142]], [176, [52, 88, 124]], [234, [88]]];
  const links = [];
  for (let l = 0; l < layers.length - 1; l += 1) layers[l][1].forEach((y1) => layers[l + 1][1].forEach((y2) => links.push([layers[l][0], y1, layers[l + 1][0], y2])));
  return (
    <>
      {links.map(([x1, y1, x2, y2]) => <line key={`${x1}${y1}${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,.15)" />)}
      <path d="M56 88 L116 68 L176 88 L234 88" fill="none" stroke={CY} strokeWidth="2.6" strokeLinejoin="round" />
      {layers.map(([x, ys], li) => ys.map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={li === 3 ? 11 : 7} fill="#0C1230" stroke={li === 3 ? PK : li === 1 ? PU : BL} strokeWidth="2.4" />))}
      <circle cx="234" cy="88" r="4" fill={PK} />
    </>
  );
}

function Nlp() {
  return (
    <>
      <path d="M36 40 a14 14 0 0 1 14 -14 H142 a14 14 0 0 1 14 14 V74 a14 14 0 0 1 -14 14 H62 L46 104 V88 H50 a14 14 0 0 1 -14 -14 Z" fill={SOFT} stroke={EDGE} strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="48" y="38" width="32" height="10" rx="5" fill={CY} fillOpacity=".85" /><rect x="86" y="38" width="50" height="10" rx="5" fill="rgba(255,255,255,.35)" />
      <rect x="48" y="56" width="58" height="10" rx="5" fill="rgba(255,255,255,.35)" /><rect x="112" y="56" width="30" height="10" rx="5" fill={PK} fillOpacity=".85" />
      <path d="M124 100 a14 14 0 0 1 14 -14 H232 a14 14 0 0 1 14 14 V134 a14 14 0 0 1 -14 14 H232 V164 L214 148 H138 a14 14 0 0 1 -14 -14 Z" fill="rgba(124,92,255,.32)" stroke={PU} strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="138" y="102" width="70" height="8" rx="4" fill="rgba(255,255,255,.5)" /><rect x="138" y="118" width="44" height="8" rx="4" fill={CY} fillOpacity=".85" /><rect x="188" y="118" width="40" height="8" rx="4" fill="rgba(255,255,255,.35)" />
      <path d={star(238, 30, 10)} fill={PU} /><circle cx="22" cy="132" r="4" fill={CY} /><circle cx="36" cy="146" r="2.6" fill={PK} />
    </>
  );
}

function Gear({ cx, cy, r, c, teeth }) {
  const dash = (2 * Math.PI * r) / teeth;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth="9" strokeDasharray={`${dash * 0.5} ${dash * 0.5}`} />
      <circle cx={cx} cy={cy} r={r - 6} fill="rgba(255,255,255,.08)" stroke={c} strokeWidth="2.4" />
      <circle cx={cx} cy={cy} r={r * 0.28} fill="#0C1230" stroke={c} strokeWidth="2.4" />
    </g>
  );
}

function Automation() {
  return (
    <>
      <Gear cx={96} cy={98} r={36} c={PU} teeth={14} />
      <Gear cx={162} cy={54} r={22} c={CY} teeth={10} />
      <path d="M176 126 H238" stroke={PK} strokeWidth="3" strokeLinecap="round" strokeDasharray="2 7" /><path d="M236 118 L250 126 L236 134 Z" fill={PK} />
      <path d="M232 36 l-14 24 h12 l-6 24 l22 -32 h-12 z" fill={PK} fillOpacity=".9" />
      <rect x="196" y="100" width="22" height="16" rx="4" fill={SOFT} stroke={EDGE} /><rect x="30" y="30" width="22" height="16" rx="4" fill={SOFT} stroke={EDGE} />
    </>
  );
}

function Database({ x, y }) {
  return (
    <g stroke={CY} strokeWidth="2.2" fill="rgba(110,168,255,.22)">
      <path d={`M${x} ${y} v50 c0 10 12 16 26 16 s26 -6 26 -16 v-50`} />
      <path d={`M${x} ${y + 20} c0 10 12 16 26 16 s26 -6 26 -16 M${x} ${y + 40} c0 10 12 16 26 16 s26 -6 26 -16`} fill="none" />
      <ellipse cx={x + 26} cy={y} rx="26" ry="9" fill="rgba(94,231,255,.35)" />
    </g>
  );
}

function Pipeline() {
  return (
    <>
      <Database x={22} y={54} />
      <path d={CLOUD} transform="translate(150 80) scale(.6)" fill="rgba(196,161,255,.3)" stroke={PU} strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M78 96 H190" stroke={CY} strokeWidth="2" strokeDasharray="4 5" fill="none" />
      {[92, 124, 156].map((x, i) => (
        <g key={x}>
          <rect x={x} y="80" width="26" height="30" rx="7" fill="#0C1230" stroke={i === 1 ? PK : BL} strokeWidth="2.2" />
          <path d={`M${x + 7} 92 H${x + 19} M${x + 7} 99 H${x + 15}`} stroke="rgba(255,255,255,.7)" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      <path d="M188 89 L202 96 L188 103 Z" fill={CY} />
    </>
  );
}

function Integration() {
  const sats = [0, 1, 2, 3, 4, 5].map((k) => { const a = (k * 60 - 30) * (Math.PI / 180); return [140 + 92 * Math.cos(a), 90 + 56 * Math.sin(a)]; });
  return (
    <>
      <ellipse cx="140" cy="90" rx="92" ry="56" fill="none" stroke="rgba(196,161,255,.3)" strokeDasharray="3 6" />
      {sats.map(([x, y], k) => <line key={k} x1="140" y1="90" x2={x} y2={y} stroke={k % 2 ? PU : CY} strokeWidth="1.8" strokeOpacity=".7" />)}
      {sats.map(([x, y], k) => (
        <g key={k}>
          <rect x={x - 14} y={y - 14} width="28" height="28" rx="8" fill="#0C1230" stroke={k % 2 ? PU : BL} strokeWidth="2.2" />
          {k % 3 === 0 && <circle cx={x} cy={y} r="5" fill="none" stroke={W} strokeWidth="2" />}
          {k % 3 === 1 && <path d={`M${x - 7} ${y - 4} H${x + 7} M${x - 7} ${y + 3} H${x + 3}`} stroke={W} strokeWidth="2" strokeLinecap="round" />}
          {k % 3 === 2 && <path d={`M${x - 6} ${y + 5} V${y - 1} M${x} ${y + 5} V${y - 6} M${x + 6} ${y + 5} V${y + 1}`} stroke={W} strokeWidth="2.4" strokeLinecap="round" />}
        </g>
      ))}
      <circle cx="140" cy="90" r="24" fill="rgba(124,92,255,.5)" stroke={CY} strokeWidth="2.6" />
      <circle cx="140" cy="90" r="9" fill={W} fillOpacity=".92" />
    </>
  );
}

function Governance() {
  return (
    <>
      <rect x="62" y="28" width="92" height="120" rx="9" fill={SOFT} stroke={EDGE} />
      <rect x="74" y="40" width="44" height="7" rx="3.5" fill={PU} />
      {[62, 80, 98, 116].map((y, i) => (
        <g key={y}>
          <path d={`M74 ${y + 4} l4 4 l7 -8`} fill="none" stroke={i === 3 ? "rgba(255,255,255,.3)" : CY} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="94" y={y} width={[48, 40, 46, 30][i]} height="6" rx="3" fill="rgba(255,255,255,.35)" />
        </g>
      ))}
      <g transform="translate(94 22) scale(.78)">
        <path d={SHIELD} fill="rgba(124,92,255,.5)" stroke={CY} strokeWidth="3.2" strokeLinejoin="round" />
        <path d="M120 88 l14 14 l28 -30" fill="none" stroke={W} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <rect x="226" y="112" width="26" height="22" rx="5" fill="#0C1230" stroke={PK} strokeWidth="2.2" /><path d="M231 112 v-6 a8 8 0 0 1 16 0 v6" fill="none" stroke={PK} strokeWidth="2.2" />
      <path d={star(40, 140, 8)} fill={CY} />
    </>
  );
}

function Analytics() {
  const h = [26, 40, 32, 56, 46, 68];
  return (
    <>
      <rect x="30" y="26" width="220" height="126" rx="11" fill="rgba(12,18,48,.72)" stroke={EDGE} />
      <circle cx="42" cy="37" r="2.6" fill={PK} /><circle cx="51" cy="37" r="2.6" fill={PU} /><circle cx="60" cy="37" r="2.6" fill={CY} />
      {h.map((v, k) => <rect key={k} x={46 + k * 21} y={140 - v} width="13" height={v} rx="3.5" fill={k === 5 ? CY : BL} fillOpacity={k === 5 ? 1 : 0.65} />)}
      <path d="M50 96 L72 84 L94 92 L116 70 L138 76 L160 54" fill="none" stroke={PK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="160" cy="54" r="4.5" fill={PK} />
      <circle cx="212" cy="92" r="24" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="9" />
      <circle cx="212" cy="92" r="24" fill="none" stroke={CY} strokeWidth="9" strokeDasharray="96 151" transform="rotate(-90 212 92)" strokeLinecap="round" />
      <rect x="190" y="46" width="48" height="8" rx="4" fill="rgba(255,255,255,.35)" /><rect x="196" y="126" width="36" height="7" rx="3.5" fill="rgba(255,255,255,.25)" />
    </>
  );
}

const SCENES = { roadmap: Roadmap, architecture: Architecture, platform: Platform, poc: Poc, delivery: Delivery, support: Support, aichip: AiChip, neural: Neural, nlp: Nlp, automation: Automation, pipeline: Pipeline, integration: Integration, governance: Governance, analytics: Analytics };
export const ART_KEYS = Object.keys(SCENES);

/** The illustration for one card: backdrop, soft glows and grid, then the scene with a neon glow. */
export default function RailArt({ id, i, art }) {
  const Scene = SCENES[art] || SCENES[ART_KEYS[i % ART_KEYS.length]];
  const [a, b] = BACKDROPS[i % BACKDROPS.length];
  return (
    <svg className="rail-art" viewBox="-80 0 440 176" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
        <radialGradient id={`${id}-r1`} cx=".82" cy=".22" r=".6"><stop offset="0" stopColor="#8B5CF6" stopOpacity=".6" /><stop offset="1" stopColor="#8B5CF6" stopOpacity="0" /></radialGradient>
        <radialGradient id={`${id}-r2`} cx=".1" cy=".95" r=".65"><stop offset="0" stopColor="#22D3EE" stopOpacity=".3" /><stop offset="1" stopColor="#22D3EE" stopOpacity="0" /></radialGradient>
        <pattern id={`${id}-gr`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#fff" strokeOpacity=".06" /></pattern>
        <filter id={`${id}-f`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.8" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <rect x="-80" width="440" height="176" fill={`url(#${id}-bg)`} />
      <rect x="-80" width="440" height="176" fill={`url(#${id}-gr)`} />
      <rect x="-80" width="440" height="176" fill={`url(#${id}-r1)`} />
      <rect x="-80" width="440" height="176" fill={`url(#${id}-r2)`} />
      <g filter={`url(#${id}-f)`}><Scene /></g>
    </svg>
  );
}
