import { I } from "./Icons";
import logoWhite from "../assets/logo-white-118.webp";

// "Meridian orbit": decorative SVG (aria-hidden). The three principles are also real text in the cards below.
const C = 220; // centre of the 440 x 440 drawing
const R = 160; // radius of the outer ring
const NODE_R = 32; // 64px circles
const CLOCK_HOURS = [10, 2, 6]; // where the three nodes sit on the ring

const polar = (hour, r) => {
  const a = (hour * 30 * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)];
};
const f = (n) => n.toFixed(1);

/** Curved connector from node a to node b, bowed towards the centre and trimmed so it starts at the circle edges. */
function arcBetween(a, b) {
  const ctrl = [C + ((a[0] + b[0]) / 2 - C) * 0.78, C + ((a[1] + b[1]) / 2 - C) * 0.78];
  const trim = (p, toward) => {
    const dx = toward[0] - p[0];
    const dy = toward[1] - p[1];
    const len = Math.hypot(dx, dy);
    const k = (NODE_R + 5) / len;
    return [p[0] + dx * k, p[1] + dy * k];
  };
  const s = trim(a, ctrl);
  const e = trim(b, ctrl);
  return `M${f(s[0])} ${f(s[1])}Q${f(ctrl[0])} ${f(ctrl[1])} ${f(e[0])} ${f(e[1])}`;
}

export default function AboutOrbit({ nodes, phase }) {
  const pts = CLOCK_HOURS.map((h) => polar(h, R));
  const arcs = [arcBetween(pts[0], pts[1]), arcBetween(pts[1], pts[2]), arcBetween(pts[2], pts[0])];
  const dots = [0, 4, 8].map((h) => polar(h + 1, R));
  return (
    <div className={"ab-orbit ab-" + phase} aria-hidden="true">
      <svg viewBox="0 0 440 440" focusable="false">
        <defs>
          <radialGradient id="ab-disc" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#5A2390" stopOpacity=".95" />
            <stop offset=".62" stopColor="#2A1458" stopOpacity=".95" />
            <stop offset="1" stopColor="#151C42" stopOpacity=".9" />
          </radialGradient>
          <radialGradient id="ab-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#9B7BD0" stopOpacity=".55" />
            <stop offset="1" stopColor="#9B7BD0" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ab-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C9B3EA" />
            <stop offset="1" stopColor="#E9A6CF" />
          </linearGradient>
        </defs>
        <circle className="ab-halo" cx={C} cy={C} r="96" fill="url(#ab-halo)" />
        <circle cx={C} cy={C} r="106" fill="none" stroke="rgba(201,179,234,.28)" strokeWidth="1" />
        <g className="ab-spin">
          <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(201,179,234,.5)" strokeWidth="1.2" strokeDasharray="2 7" />
          {dots.map(([x, y], i) => <circle key={i} cx={f(x)} cy={f(y)} r="3" fill="#C9B3EA" opacity=".75" />)}
        </g>
        {arcs.map((d, i) => (
          <path key={i} className="ab-arc" d={d} pathLength="1" fill="none" stroke="url(#ab-arc)" strokeWidth="1.5" strokeLinecap="round" style={{ "--i": i }} />
        ))}
        <g className="ab-core">
          <circle className="ab-pulse" cx={C} cy={C} r="58" fill="url(#ab-disc)" stroke="rgba(201,179,234,.55)" strokeWidth="1.5" />
          <image href={logoWhite} x={C - 38} y={C - 25.5} width="76" height="51" />
        </g>
        {nodes.map(([ic, label], i) => (
          <g key={label} className="ab-node" transform={`translate(${f(pts[i][0])} ${f(pts[i][1])})`} style={{ "--i": i }}>
            <circle r={NODE_R} fill="#151C42" stroke="rgba(201,179,234,.6)" strokeWidth="1.5" />
            <g className="ab-node-ic" transform="translate(-13.2 -13.2) scale(1.2)">{I[ic]}</g>
            <text y={NODE_R + 20} textAnchor="middle">{label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
