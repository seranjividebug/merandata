import { useId, useState } from "react";
import { I } from "./Icons";
import logoWhite from "../assets/logo-white-118.webp";

// "Approach Venn": three overlapping circles (the three principles) around the Meridanta monogram.
// The drawing is decorative (aria-hidden); the principles are real text in the legend below it (h3 + paragraph).
const CENTRE = [230, 243];
const R = 130;
const CIRCLES = [
  { cx: 230, cy: 150, color: "#42116F", icon: [230, 50], text: [230, 84], slide: [0, -40] },
  { cx: 150, cy: 290, color: "#1E2A6B", icon: [102, 314], text: [102, 348], slide: [-35, 20] },
  { cx: 310, cy: 290, color: "#7A3A9E", icon: [358, 314], text: [358, 348], slide: [35, 20] },
];

/** Two short lines for a circle title ("Business" / "understanding"). */
const lines = (title) => {
  const i = title.indexOf(" ");
  return i < 0 ? [title] : [title.slice(0, i), title.slice(i + 1)];
};

function Circle({ c, i, title, icon, active, setActive }) {
  const on = active === i;
  const cls = "vn-c" + (on ? " is-on" : "") + (active !== null && !on ? " is-dim" : "");
  return (
    <g className="vn-slide" style={{ "--i": i, "--dx": c.slide[0] + "px", "--dy": c.slide[1] + "px" }}>
      <g className={cls} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
        <circle className="vn-fill" cx={c.cx} cy={c.cy} r={R} fill={c.color} stroke={c.color} strokeWidth="1.5" />
        <g className="vn-ic" style={{ color: c.color }} transform={`translate(${c.icon[0] - 14.3} ${c.icon[1] - 14.3}) scale(1.3)`}>{icon}</g>
        <text className="vn-t" textAnchor="middle" fill={c.color}>
          {lines(title).map((l, k) => <tspan key={l} x={c.text[0]} y={c.text[1] + k * 17}>{l}</tspan>)}
        </text>
      </g>
    </g>
  );
}

export default function AboutVenn({ pillars, phase }) {
  const [active, setActive] = useState(null);
  const base = useId();
  return (
    <div className={"vn vn-" + phase}>
      <div className="vn-art" aria-hidden="true">
        <svg viewBox="0 0 460 440" focusable="false">
          <defs>
            <radialGradient id={base + "-glow"} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#7A3A9E" stopOpacity=".5" />
              <stop offset="1" stopColor="#7A3A9E" stopOpacity="0" />
            </radialGradient>
          </defs>
          {CIRCLES.map((c, i) => <Circle key={i} c={c} i={i} title={pillars[i][1]} icon={I[pillars[i][0]]} active={active} setActive={setActive} />)}
          <g className="vn-core">
            <circle className="vn-glow" cx={CENTRE[0]} cy={CENTRE[1]} r="72" fill={`url(#${base}-glow)`} />
            <circle cx={CENTRE[0]} cy={CENTRE[1]} r="45" fill="#0C1230" />
            <image href={logoWhite} x={CENTRE[0] - 27} y={CENTRE[1] - 18} width="54" height="36" />
            <text className="vn-label" x={CENTRE[0]} y={CENTRE[1] + 66} textAnchor="middle">Meridanta</text>
          </g>
        </svg>
      </div>
      <ul className="vn-legend">
        {pillars.map(([ic, t, d], i) => (
          <li key={t} className={"vn-item" + (active === i ? " is-on" : "")} style={{ "--c": CIRCLES[i].color }} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
            <span className="vn-item-ic" aria-hidden="true">{I[ic]}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
