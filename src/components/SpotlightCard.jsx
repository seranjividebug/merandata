import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { logoSource } from "../logoMap";
import { CIcon } from "./caseIcons";
import "../spotlight.css";

const TILT_DEG = 4;

/** True while the media query matches (re-evaluated on change). */
function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/** A logo (simple-icons brands only) or a generic icon, on a white round tile. */
export function LogoTile({ item, size = 52 }) {
  const src = item.key ? logoSource(item.key, "card") : null;
  return (
    <span className="spot-tile" style={{ width: size, height: size }} aria-hidden="true">
      {src && src.type === "icon"
        ? <svg viewBox="0 0 24 24" width={size * 0.55} height={size * 0.55}><path d={src.path} fill={src.hex} /></svg>
        : <CIcon name={item.kind || "server"} size={size * 0.46} />}
    </span>
  );
}

/**
 * Compact spotlight card: preview on top, then pill, title, one line, stat chips and a footer link.
 * The whole card is one link. `visual` is the preview content (it sits under the bottom fade).
 */
export default function SpotlightCard({ to, title, line, chips, cta, visual, label }) {
  const ref = useRef(null);
  const fine = useMedia("(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)");

  const onMove = (e) => {
    if (!fine || e.pointerType !== "mouse") return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--ry", `${(px * 2 * TILT_DEG).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-py * 2 * TILT_DEG).toFixed(2)}deg`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--ry", "0deg");
    ref.current?.style.setProperty("--rx", "0deg");
  };

  return (
    <Link ref={ref} to={to} className="spot" aria-label={label} onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="spot-vis" aria-hidden="true">{visual}</div>
      <div className="spot-body">
        <span className="badge"><i />Home-grown solution</span>
        <h3>{title}</h3>
        <p className="spot-line">{line}</p>
        <ul className="spot-chips">{chips.map((c) => <li key={c}>{c}</li>)}</ul>
        <span className="spot-cta">{cta}<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span>
      </div>
    </Link>
  );
}
