import { useCallback, useEffect, useRef, useState } from "react";
import { QLIK_JOURNEY, QLIK_OFFERINGS } from "../qlikData";
import { useSectionLink } from "../nav";
import { REDUCED } from "../utils";
import { CIcon } from "./caseIcons";
import "../serviceJourney.css";

const STEPS = QLIK_OFFERINGS.map((o, i) => ({ ...o, ...QLIK_JOURNEY[i], n: String(i + 1).padStart(2, "0") }));
const COUNT = STEPS.length;
// Wheel drawing grid (px at the 16px base; the wheel scales with its column).
const W = 520;
const H = 456;
const CX = W / 2;
const CY = H / 2;
const R = 148;
const POS = [[0, -R], [R, 0], [0, R], [-R, 0]]; // 12, 3, 6 and 9 o'clock
const SIDE = ["top", "right", "bottom", "left"];
const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Qlik COE offerings as a scroll-driven journey: a sticky wheel beside the service panels. */
export default function ServiceJourney() {
  const link = useSectionLink();
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(0); // content in the wheel centre (lags during the crossfade)
  const [out, setOut] = useState(false);
  const [u, setU] = useState(0); // scroll progress through the panels, 0..1
  const panels = useRef([]);
  const column = useRef(null);
  const fade = useRef(0);

  // Which panel is crossing the viewport centre.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.step)); }),
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    panels.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Progress through the right column, computed once per frame while scrolling.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = column.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const next = clamp((window.innerHeight / 2 - r.top) / r.height);
      setU((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Crossfade the centre disc when the step changes.
  useEffect(() => {
    window.clearTimeout(fade.current);
    if (REDUCED || active === shown) { setShown(active); setOut(false); return undefined; }
    setOut(true);
    fade.current = window.setTimeout(() => { setShown(active); setOut(false); }, 125);
    return () => window.clearTimeout(fade.current);
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = useCallback((i) => {
    panels.current[i]?.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "center" });
  }, []);

  // Arc position 0..1 round the ring (snaps to the step for reduced motion); bar fill 0..1.
  const arc = REDUCED ? active / COUNT : u;
  const barFill = REDUCED ? active / (COUNT - 1) : clamp((u * COUNT - 0.5) / (COUNT - 1));
  const done = (i) => i < active || (!REDUCED && u > 0.985);
  const cur = STEPS[shown];

  return (
    <div className="sj">
      {/* Tablet / mobile: compact step bar, sticky under the header */}
      <div className="sj-bar">
        <span className="sj-bar-track" aria-hidden="true"><span style={{ transform: `scaleX(${barFill})` }} /></span>
        {STEPS.map((s, i) => (
          <button
            key={s.title}
            type="button"
            className={"sj-bar-dot" + (i === active ? " is-active" : "") + (done(i) ? " is-done" : "")}
            aria-label={`Go to ${s.title}`}
            aria-current={i === active ? "step" : undefined}
            onClick={() => goTo(i)}
          >
            <CIcon name={s.icon} size={20} />
          </button>
        ))}
      </div>

      {/* Desktop: sticky journey wheel */}
      <div className="sj-left">
        <div className="sj-wheel">
          <svg className="sj-ring" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="sj-grad" gradientUnits="userSpaceOnUse" x1={CX - R} y1={CY + R} x2={CX + R} y2={CY - R}>
                <stop offset="0" stopColor="#42116F" />
                <stop offset=".55" stopColor="#9B4DA8" />
                <stop offset="1" stopColor="#EC5FAE" />
              </linearGradient>
            </defs>
            <circle className="sj-ring-base" cx={CX} cy={CY} r={R} />
            <circle
              className="sj-ring-arc"
              cx={CX}
              cy={CY}
              r={R}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - Math.max(arc, 0.0005)}
              transform={`rotate(-90 ${CX} ${CY})`}
            />
          </svg>

          {STEPS.map((s, i) => (
            <div key={s.title} className={"sj-node sj-at-" + SIDE[i]} style={{ left: `${((CX + POS[i][0]) / W) * 100}%`, top: `${((CY + POS[i][1]) / H) * 100}%` }}>
              <button
                type="button"
                className={"sj-btn" + (i === active ? " is-active" : "") + (done(i) ? " is-done" : "")}
                aria-label={`Go to ${s.title}`}
                aria-current={i === active ? "step" : undefined}
                onClick={() => goTo(i)}
              >
                <CIcon name={s.icon} size={26} />
                {done(i) && i !== active && <span className="sj-check"><CIcon name="check" size={12} strokeWidth={3} /></span>}
              </button>
              <span className="sj-label" aria-hidden="true">{s.title}</span>
            </div>
          ))}

          <div className="sj-disc" aria-live="polite">
            <div className={"sj-disc-in" + (out ? " is-out" : "")} key={shown}>
              <span className="sj-num">{cur.n}</span>
              <strong>{cur.title}</strong>
              <span className="sj-desc">{cur.description}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service panels */}
      <div className="sj-panels" ref={column}>
        {STEPS.map((s, i) => (
          <article
            key={s.title}
            data-step={i}
            ref={(el) => { panels.current[i] = el; }}
            className={"sj-panel" + (i === active ? " is-active" : " is-dim")}
            aria-labelledby={`sj-h-${i}`}
          >
            <span className="sj-accent" aria-hidden="true" />
            <p className="sj-eyebrow">Step {s.n}</p>
            <h3 id={`sj-h-${i}`}>{s.title}</h3>
            <p className="sj-lead">{s.description}</p>
            <ul className="sj-checks">
              {s.items.map((t) => (
                <li key={t}><CIcon name="check" size={18} strokeWidth={2.4} /><span>{t}</span></li>
              ))}
            </ul>
            <p className="sj-outcome"><strong>Outcome</strong>{s.outcome}</p>
          </article>
        ))}
        <div className="sj-cta">
          <a className="btn btn-grad" {...link("contact")}>Start with a free consultation</a>
        </div>
      </div>
    </div>
  );
}
