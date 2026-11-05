import { useId } from "react";
import { logoSource, logosFor } from "../logoMap";
import { REDUCED } from "../utils";
import { iconPaths } from "./caseIcons";

// Drawing grids. The picture scales with its container.
// Horizontal: sources left, engine centre, targets right. Vertical (phones): sources top, targets bottom.
// `FULL` is the roomy version; `COMPACT` fits the showcase panel's fixed-height diagram box.
const FULL = {
  H_W: 700, H_SRC_X: 104, V_W: 360, V_CELL_MAX: 160,
  V_GAP: 64, // space for the connectors between the rows and the engine ring
  TILE_H: 72, SLOT_W: 60, GAP: 16, LOGO_H: 40,
  ENGINE: 140, ENGINE_TOP: 82, // height of the white logo area; the rest is the gradient name band
  RING: 108, PAD: 14, LABEL_AT: 22, LABEL_LH: 18, CAPT: 24, CAPT_GAP: 18, WRAP: 24,
  ENAME_1: 34, ENAME_2: 24, ENAME_DY: 18, ELOGO_W: 96, ELOGO_H: 46, ELOGO_S: 1.3,
};
const COMPACT = {
  H_W: 560, H_SRC_X: 80, V_W: 360, V_CELL_MAX: 130,
  V_GAP: 48,
  TILE_H: 56, SLOT_W: 46, GAP: 8, LOGO_H: 30,
  ENGINE: 112, ENGINE_TOP: 64,
  RING: 80, PAD: 8, LABEL_AT: 16, LABEL_LH: 14, CAPT: 14, CAPT_GAP: 13, WRAP: 20,
  ENAME_1: 31, ENAME_2: 21, ENAME_DY: 14, ELOGO_W: 72, ELOGO_H: 34, ELOGO_S: 1,
};

// Phones: the vertical flow in a 240px box, so the engine and the gaps shrink a little more.
const COMPACT_V = { ...COMPACT, V_GAP: 34, RING: 66, ENGINE: 96, ENGINE_TOP: 54, ENAME_1: 27, ENAME_2: 18, ELOGO_W: 60, ELOGO_H: 28 };

const CAPTIONS = {
  oneWay: ["Source", "Target"],
  fanOut: ["Source", "Targets"],
  bidirectional: ["System A", "System B"],
  migration: ["Before", "After"],
};

/** Break a label into at most `lines` lines of about `max` characters. */
export function wrapLabel(label, max = 24, lines = 2) {
  const out = [];
  let cur = "";
  for (const word of label.split(/\s+/)) {
    if (cur && (cur + " " + word).length > max) { out.push(cur); cur = word; }
    else cur = cur ? cur + " " + word : word;
  }
  if (cur) out.push(cur);
  return out.length > lines ? [...out.slice(0, lines - 1), out.slice(lines - 1).join(" ")] : out;
}

/** Generic icon for a label that matches no brand. */
const genericKind = (label) => (/cloud|lake|warehouse/i.test(label) ? "cloud" : /server|platform|release/i.test(label) ? "server" : "database");

/** One logo, drawn into a box centred on (cx, cy). Never stretched, recolored or cropped. */
function Logo({ keyName, label, cx, cy, boxW, boxH, scale = 1 }) {
  const src = keyName ? logoSource(keyName) : { type: "text", name: label, short: "", kind: genericKind(label) };
  if (src.type === "file") {
    return <image href={src.url} x={cx - boxW / 2} y={cy - boxH / 2} width={boxW} height={boxH} preserveAspectRatio="xMidYMid meet"><title>{src.name}</title></image>;
  }
  if (src.type === "icon") {
    const s = Math.min(boxH, boxW, 36 * scale);
    return (
      <svg x={cx - s / 2} y={cy - s / 2} width={s} height={s} viewBox="0 0 24 24" role="img" aria-label={src.name}>
        <title>{src.name}</title>
        <path d={src.path} fill={src.hex} />
      </svg>
    );
  }
  const ic = 26 * scale;
  return (
    <g className="cd-badge" aria-label={src.name}>
      <g transform={`translate(${cx - ic / 2} ${cy - ic / 2 - (src.short ? 7 * scale : 0)}) scale(${ic / 24})`}>{iconPaths(src.kind)}</g>
      {src.short && <text x={cx} y={cy + 20 * scale} textAnchor="middle" style={{ fontSize: 10.5 * scale }}>{src.short}</text>}
    </g>
  );
}

const keysFor = (label) => {
  const k = logosFor(label);
  return (k.length ? k : [null]).slice(0, 3);
};

/** Measure a node: logo keys, tile width, label lines and block height. `cellW` caps the width (vertical layout). */
function measure(label, cellW, g) {
  const keys = keysFor(label);
  const lines = wrapLabel(label, cellW ? Math.max(9, Math.floor(cellW / (g.TILE_H < 60 ? 6.6 : 8.4))) : g.TILE_H < 60 ? g.WRAP : 21, cellW ? 3 : 2);
  const w = Math.min(Math.max(g.TILE_H, keys.length * g.SLOT_W + 16), cellW || Infinity);
  const area = g.LABEL_AT + (lines.length - 1) * g.LABEL_LH + g.CAPT; // label and caption
  return { label, keys, lines, w, area, h: g.TILE_H + area };
}

/** `flip` puts the label and caption above the tile (vertical sources, so the tile faces the engine). */
function Node({ n, flip, caption, badge, g }) {
  const x = n.cx - n.w / 2;
  const cy = n.tileTop + g.TILE_H / 2;
  const slot = n.w / n.keys.length;
  const labelY = flip ? n.top + 14 + g.LABEL_LH + 2 : n.tileTop + g.TILE_H + g.LABEL_AT;
  const captionY = flip ? n.top + 14 : labelY + (n.lines.length - 1) * g.LABEL_LH + g.CAPT_GAP;
  return (
    <g className="cd-node">
      <rect className="cd-tile" x={x} y={n.tileTop} width={n.w} height={g.TILE_H} rx="18" />
      {n.keys.map((k, i) => (
        <Logo key={(k || "x") + i} keyName={k} label={n.label} cx={x + slot * (i + 0.5)} cy={cy} boxW={slot - 12} boxH={g.LOGO_H} />
      ))}
      <text className="cd-label" x={n.cx} y={labelY} textAnchor="middle">
        {n.lines.map((t, i) => <tspan key={t + i} x={n.cx} dy={i === 0 ? 0 : g.LABEL_LH}>{t}</tspan>)}
      </text>
      <text className="cd-capt" x={n.cx} y={captionY} textAnchor="middle">{caption}</text>
      {badge && (
        <g className="cd-check" transform={`translate(${x + n.w - 2} ${n.tileTop + 2})`}>
          <circle r="14" />
          <path d="m-6 0 4.5 4.5 8-9.5" />
        </g>
      )}
    </g>
  );
}

const curveH = (x1, y1, x2, y2) => {
  const k = Math.max(40, Math.abs(x2 - x1) * 0.5);
  return `M${x1} ${y1} C${x1 + k} ${y1} ${x2 - k} ${y2} ${x2} ${y2}`;
};
const curveV = (x1, y1, x2, y2) => {
  const k = Math.max(30, Math.abs(y2 - y1) * 0.5);
  return `M${x1} ${y1} C${x1} ${y1 + k} ${x2} ${y2 - k} ${x2} ${y2}`;
};

/** Two glowing dots travelling along a path. Skipped for reduced motion. */
function Dots({ d, glow, offset = 0 }) {
  if (REDUCED) return null;
  return [0, 1].map((i) => (
    <g key={i} filter={`url(#${glow})`}>
      <circle r="9" fill="#9B7BD0" opacity=".4" />
      <circle r="3.6" fill="#fff" />
      <animateMotion path={d} dur="3s" begin={`${-(offset + i * 1.5)}s`} repeatCount="indefinite" />
    </g>
  ));
}

/** Lay out the nodes, engine and connector paths for either orientation. */
function layout({ sources, targets, mode, vertical, g }) {
  const both = mode === "bidirectional";
  const off = both ? 9 : 0;
  const flows = [];
  const add = (a, b, bi) => {
    const f = vertical ? curveV : curveH;
    flows.push(f(...a));
    if (bi) flows.push(f(...b));
  };

  if (!vertical) {
    const left = sources.map((l) => measure(l, undefined, g));
    const right = targets.map((l) => measure(l, undefined, g));
    const colH = (c) => c.reduce((n, d) => n + d.h, 0) + g.GAP * (c.length - 1);
    const body = Math.max(colH(left), colH(right), g.RING * 2 + 24);
    const H = body + g.PAD * 2;
    const cy = H / 2;
    const mid = g.H_W / 2;
    const place = (col, cx) => {
      let y = cy - colH(col) / 2;
      return col.map((d) => { const top = y; y += d.h + g.GAP; return { ...d, cx, top, tileTop: top }; });
    };
    const L = place(left, g.H_SRC_X);
    const R = place(right, g.H_W - g.H_SRC_X);
    const ringL = mid - g.RING - 2;
    const ringR = mid + g.RING + 2;
    L.forEach((n) => {
      const y = n.tileTop + g.TILE_H / 2;
      const x = n.cx + n.w / 2 + 4;
      add([x, y - off, ringL, cy - off], [ringL, cy + off, x, y + off], both);
    });
    R.forEach((n) => {
      const y = n.tileTop + g.TILE_H / 2;
      const x = n.cx - n.w / 2 - 4;
      add([ringR, cy - off, x, y - off], [x, y + off, ringR, cy + off], both);
    });
    return { W: g.H_W, H, L, R, ex: mid, cy, flows };
  }

  // Vertical: a row of sources on top, the engine in the middle, a row of targets below.
  const row = (labels) => {
    const cell = Math.min(g.V_CELL_MAX, Math.floor((g.V_W - 16) / labels.length));
    const nodes = labels.map((l) => measure(l, cell - 8, g));
    const x0 = (g.V_W - cell * labels.length) / 2;
    return { nodes: nodes.map((d, i) => ({ ...d, cx: x0 + cell * (i + 0.5) })), h: Math.max(...nodes.map((d) => d.h)) };
  };
  const top = row(sources);
  const bottom = row(targets);
  const mid = g.V_W / 2;
  const ringTop = g.PAD + top.h + g.V_GAP;
  const cy = ringTop + g.RING + 2;
  const ringBottom = cy + g.RING + 2;
  const bottomTop = ringBottom + g.V_GAP;
  const H = bottomTop + bottom.h + g.PAD;
  const L = top.nodes.map((d) => { const t = g.PAD + (top.h - d.h); return { ...d, top: t, tileTop: t + d.area }; });
  const R = bottom.nodes.map((d) => ({ ...d, top: bottomTop, tileTop: bottomTop }));
  L.forEach((n) => {
    const y = n.tileTop + g.TILE_H + 4;
    add([n.cx - off, y, mid - off, ringTop - 2], [mid + off, ringTop - 2, n.cx + off, y], both);
  });
  R.forEach((n) => {
    const y = n.tileTop - 4;
    add([mid - off, ringBottom, n.cx - off, y], [n.cx + off, y, mid + off, ringBottom], both);
  });
  return { W: g.V_W, H, L, R, ex: mid, cy, flows };
}

/** Brand-style flow picture generated from `case.diagram`. `vertical` stacks it top to bottom for phones. */
export default function CaseDiagram({ diagram, title, vertical = false, compact = false }) {
  const g = compact ? (vertical ? COMPACT_V : COMPACT) : FULL;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { sources, targets, engine, mode } = diagram;
  const both = mode === "bidirectional";
  const [capL, capR] = CAPTIONS[mode] || CAPTIONS.oneWay;
  const { W, H, L, R, ex, cy, flows } = layout({ sources, targets, mode, vertical, g });

  const engineName = engine.replace(/^Qlik\s+/i, "");
  const engineLogo = logosFor(engine)[0] || "qlik";
  const nameLines = wrapLabel(engineName, 15, 2);
  const ex0 = ex - g.ENGINE / 2;
  const ey = cy - g.ENGINE / 2;
  const summary = `${sources.join(", ")} ${both ? "synchronised both ways with" : "to"} ${targets.join(", ")} using ${engine}`;

  return (
    <figure className={"cd" + (vertical ? " is-vertical" : "") + (compact ? " is-compact" : "")}>
      <div className="cd-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: ${summary}`}>
          <defs>
            <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#2A1458" />
              <stop offset=".55" stopColor="#4A1F86" />
              <stop offset="1" stopColor="#7A3A9E" />
            </linearGradient>
            <radialGradient id={`h${uid}`}>
              <stop offset="0" stopColor="#5A2390" stopOpacity=".3" />
              <stop offset="1" stopColor="#5A2390" stopOpacity="0" />
            </radialGradient>
            <clipPath id={`c${uid}`}><rect x={ex0} y={ey} width={g.ENGINE} height={g.ENGINE} rx="24" /></clipPath>
            <filter id={`f${uid}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" /></filter>
            <marker id={`a${uid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M1 1.5 8.5 5 1 8.5Z" fill="#C9B3EA" />
            </marker>
          </defs>

          {flows.map((d, i) => (
            <g key={i}>
              <path className="cd-rail" d={d} />
              <path className="cd-flow" d={d} markerEnd={`url(#a${uid})`} />
              <Dots d={d} glow={`f${uid}`} offset={(i % 3) * 0.5} />
            </g>
          ))}

          <circle cx={ex} cy={cy} r={g.RING + 30} fill={`url(#h${uid})`} />
          <circle className="cd-ring" cx={ex} cy={cy} r={g.RING - 4} />

          {L.map((n, i) => <Node key={n.label + i} n={n} flip={vertical} caption={capL} g={g} />)}
          {R.map((n, i) => <Node key={n.label + i} n={n} caption={capR} badge={mode === "migration"} g={g} />)}

          <g>
            <rect className="cd-engine" x={ex0} y={ey} width={g.ENGINE} height={g.ENGINE} rx="24" fill={`url(#g${uid})`} />
            <g clipPath={`url(#c${uid})`}>
              <rect x={ex0} y={ey} width={g.ENGINE} height={g.ENGINE_TOP} fill="#fff" />
            </g>
            <Logo keyName={engineLogo} label={engine} cx={ex} cy={ey + g.ENGINE_TOP / 2} boxW={g.ELOGO_W} boxH={g.ELOGO_H} scale={g.ELOGO_S} />
            <text className="cd-engine-t" x={ex} y={ey + g.ENGINE_TOP + (nameLines.length > 1 ? g.ENAME_2 : g.ENAME_1)} textAnchor="middle">
              {nameLines.map((t, i) => <tspan key={t + i} x={ex} dy={i === 0 ? 0 : g.ENAME_DY}>{t}</tspan>)}
            </text>
          </g>
        </svg>
      </div>
    </figure>
  );
}
