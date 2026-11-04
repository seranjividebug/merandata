import { useId } from "react";
import { logoSource, logosFor } from "../logoMap";
import { REDUCED } from "../utils";
import { iconPaths } from "./caseIcons";

// Fixed drawing grid. The picture scales with its container (and scrolls sideways on narrow screens).
const W = 1040;
const TILE_H = 72;
const SLOT_W = 60;
const GAP = 16;
const SRC_X = 118;
const TGT_X = W - SRC_X;
const MID = W / 2;
const ENGINE = 140;
const ENGINE_TOP = 82; // height of the white logo area; the rest is the gradient name band
const RING = 108;
const PAD = 14;
const LABEL_AT = 22;
const LABEL_LH = 18;

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
    const s = Math.min(boxH, 36 * scale);
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

/** Measure a node: logo keys, tile width, label lines and total block height. */
function measure(label) {
  const keys = keysFor(label);
  const lines = wrapLabel(label);
  const w = Math.max(72, keys.length * SLOT_W + 16);
  const captionY = TILE_H + LABEL_AT + (lines.length - 1) * LABEL_LH + 18;
  return { label, keys, lines, w, captionY, h: captionY + 6 };
}

/** Top positions for a column of nodes, centred on `cy` with equal gaps. */
function stack(nodes, cy) {
  const total = nodes.reduce((n, d) => n + d.h, 0) + GAP * (nodes.length - 1);
  let y = cy - total / 2;
  return nodes.map((d) => { const top = y; y += d.h + GAP; return { ...d, top }; });
}

function Node({ n, cx, caption, badge }) {
  const x = cx - n.w / 2;
  const cy = n.top + TILE_H / 2;
  const slot = n.w / n.keys.length;
  return (
    <g className="cd-node">
      <rect className="cd-tile" x={x} y={n.top} width={n.w} height={TILE_H} rx="18" />
      {n.keys.map((k, i) => (
        <Logo key={(k || "x") + i} keyName={k} label={n.label} cx={x + slot * (i + 0.5)} cy={cy} boxW={slot - 12} boxH={40} />
      ))}
      <text className="cd-label" x={cx} y={n.top + TILE_H + LABEL_AT} textAnchor="middle">
        {n.lines.map((t, i) => <tspan key={t + i} x={cx} dy={i === 0 ? 0 : LABEL_LH}>{t}</tspan>)}
      </text>
      <text className="cd-capt" x={cx} y={n.top + n.captionY} textAnchor="middle">{caption}</text>
      {badge && (
        <g className="cd-check" transform={`translate(${x + n.w - 2} ${n.top + 2})`}>
          <circle r="14" />
          <path d="m-6 0 4.5 4.5 8-9.5" />
        </g>
      )}
    </g>
  );
}

const curve = (x1, y1, x2, y2) => {
  const k = Math.max(40, Math.abs(x2 - x1) * 0.5);
  return `M${x1} ${y1} C${x1 + k} ${y1} ${x2 - k} ${y2} ${x2} ${y2}`;
};

/** Two glowing dots travelling along a path. Skipped for reduced motion. */
function Dots({ d, glow, offset = 0 }) {
  if (REDUCED) return null;
  return [0, 1].map((i) => (
    <g key={i} filter={`url(#${glow})`}>
      <circle r="9" fill="#EC5FAE" opacity=".45" />
      <circle r="3.6" fill="#fff" />
      <animateMotion path={d} dur="3s" begin={`${-(offset + i * 1.5)}s`} repeatCount="indefinite" />
    </g>
  ));
}

/** Brand-style flow picture generated from `case.diagram`. */
export default function CaseDiagram({ diagram, title }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { sources, targets, engine, mode } = diagram;
  const both = mode === "bidirectional";
  const [capL, capR] = CAPTIONS[mode] || CAPTIONS.oneWay;

  const left = sources.map(measure);
  const right = targets.map(measure);
  const colH = (c) => c.reduce((n, d) => n + d.h, 0) + GAP * (c.length - 1);
  const body = Math.max(colH(left), colH(right), RING * 2 + 24);
  const H = body + PAD * 2;
  const cy = H / 2;
  const L = stack(left, cy);
  const R = stack(right, cy);

  const off = both ? 9 : 0;
  const ringL = MID - RING - 2;
  const ringR = MID + RING + 2;
  const flows = [];
  L.forEach((n) => {
    const y = n.top + TILE_H / 2;
    const x = SRC_X + n.w / 2 + 4;
    flows.push(curve(x, y - off, ringL, cy - off));
    if (both) flows.push(curve(ringL, cy + off, x, y + off));
  });
  R.forEach((n) => {
    const y = n.top + TILE_H / 2;
    const x = TGT_X - n.w / 2 - 4;
    flows.push(curve(ringR, cy - off, x, y - off));
    if (both) flows.push(curve(x, y + off, ringR, cy + off));
  });

  const engineName = engine.replace(/^Qlik\s+/i, "");
  const engineLogo = logosFor(engine)[0] || "qlik";
  const nameLines = wrapLabel(engineName, 15, 2);
  const ex = MID - ENGINE / 2;
  const ey = cy - ENGINE / 2;
  const summary = `${sources.join(", ")} ${both ? "synchronised both ways with" : "to"} ${targets.join(", ")} using ${engine}`;

  return (
    <figure className="cd">
      <div className="cd-scroll" tabIndex={0} role="group" aria-label="Use case picture, scrolls sideways on small screens">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: ${summary}`}>
          <defs>
            <linearGradient id={`g${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#42116F" />
              <stop offset=".55" stopColor="#9B4DA8" />
              <stop offset="1" stopColor="#EC5FAE" />
            </linearGradient>
            <radialGradient id={`h${uid}`}>
              <stop offset="0" stopColor="#EC5FAE" stopOpacity=".55" />
              <stop offset="1" stopColor="#EC5FAE" stopOpacity="0" />
            </radialGradient>
            <clipPath id={`c${uid}`}><rect x={ex} y={ey} width={ENGINE} height={ENGINE} rx="24" /></clipPath>
            <filter id={`f${uid}`} x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="3" /></filter>
            <marker id={`a${uid}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M1 1.5 8.5 5 1 8.5Z" fill="#F3C9E3" />
            </marker>
          </defs>

          {flows.map((d, i) => (
            <g key={i}>
              <path className="cd-rail" d={d} />
              <path className="cd-flow" d={d} markerEnd={`url(#a${uid})`} />
              <Dots d={d} glow={`f${uid}`} offset={(i % 3) * 0.5} />
            </g>
          ))}

          <circle cx={MID} cy={cy} r={RING + 30} fill={`url(#h${uid})`} />
          <circle className="cd-ring" cx={MID} cy={cy} r={RING - 4} />

          {L.map((n, i) => <Node key={n.label + i} n={n} cx={SRC_X} caption={capL} />)}
          {R.map((n, i) => <Node key={n.label + i} n={n} cx={TGT_X} caption={capR} badge={mode === "migration"} />)}

          <g>
            <rect className="cd-engine" x={ex} y={ey} width={ENGINE} height={ENGINE} rx="24" fill={`url(#g${uid})`} />
            <g clipPath={`url(#c${uid})`}>
              <rect x={ex} y={ey} width={ENGINE} height={ENGINE_TOP} fill="#fff" />
            </g>
            <Logo keyName={engineLogo} label={engine} cx={MID} cy={ey + ENGINE_TOP / 2} boxW={96} boxH={46} scale={1.3} />
            <text className="cd-engine-t" x={MID} y={ey + ENGINE_TOP + (nameLines.length > 1 ? 24 : 34)} textAnchor="middle">
              {nameLines.map((t, i) => <tspan key={t + i} x={MID} dy={i === 0 ? 0 : 18}>{t}</tspan>)}
            </text>
          </g>
        </svg>
      </div>
    </figure>
  );
}
