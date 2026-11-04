import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { accelerators } from "../accelerators";
import { ACCELERATOR_STACK } from "../acceleratorStack";
import { QLIK_BENEFITS } from "../data";
import { logoSource } from "../logoMap";
import { useSectionLink } from "../nav";
import { REDUCED } from "../utils";
import AnimatedButton from "./AnimatedButton";
import { CIcon } from "./caseIcons";
import { I } from "./Icons";
import "../accelerators.css";

const HASH_PREFIX = "accelerator-";
const OUT_MS = 120;
// Icon order follows the source slides.
const FEATURE_ICONS = ["chart", "updown", "gauge", "challenge", "bell"];
const BENEFIT_ICONS = ["clock", "eye", "gear", "bell", "outcome"];

const setHash = (id) => {
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, "", `${pathname}${search}#${HASH_PREFIX}${id}`);
};

/** A logo (simple-icons brands only) or a generic icon, on a white tile. */
function Tile({ item, size }) {
  const src = item.key ? logoSource(item.key, "card") : null;
  return (
    <span className="ax-tile" style={{ width: size, height: size }} aria-hidden="true">
      {src && src.type === "icon"
        ? <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62}><path d={src.path} fill={src.hex} /></svg>
        : <CIcon name={item.kind || "server"} size={size * 0.55} />}
    </span>
  );
}

/** Qlik Accelerators card: header, tabs and the active accelerator's panel, all in place. */
export default function AcceleratorsCard({ seeAll = false, headingId = "acc-h" }) {
  const link = useSectionLink();
  const { hash, key } = useLocation();
  const [active, setActive] = useState(accelerators[0].id); // the selected tab
  const [shown, setShown] = useState(accelerators[0].id); // the content on screen (lags during the fade)
  const [out, setOut] = useState(false);
  const [height, setHeight] = useState(null);
  const [ind, setInd] = useState(null);
  const card = useRef(null);
  const bar = useRef(null);
  const inner = useRef(null);
  const latest = useRef(active);
  const timer = useRef(0);
  const firstImg = useRef(null);
  const [firstLoaded, setFirstLoaded] = useState(false);

  const index = accelerators.findIndex((a) => a.id === active);
  const acc = accelerators.find((a) => a.id === shown);
  const total = accelerators.length;

  const select = useCallback((id, { focus = false } = {}) => {
    latest.current = id;
    setActive(id);
    setHash(id);
    window.clearTimeout(timer.current);
    if (REDUCED) setShown(id);
    else {
      setOut(true);
      timer.current = window.setTimeout(() => { setShown(latest.current); setOut(false); }, OUT_MS);
    }
    if (focus) requestAnimationFrame(() => bar.current?.querySelector(`#ax-tab-${id}`)?.focus());
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Deep link: #accelerator-<id> selects that tab and scrolls the card into view.
  useEffect(() => {
    if (!hash.startsWith("#" + HASH_PREFIX)) return;
    const id = hash.slice(1 + HASH_PREFIX.length);
    if (!accelerators.some((a) => a.id === id)) return;
    latest.current = id;
    setActive(id);
    setShown(id);
    setOut(false);
    card.current?.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
  }, [hash, key]);

  // Slide the indicator under the active tab, and keep that tab in view in the scrolling tab bar.
  const measure = useCallback(() => {
    const b = bar.current;
    const t = b?.querySelector(`#ax-tab-${active}`);
    if (!t) return;
    setInd({ x: t.offsetLeft, y: t.offsetTop, w: t.offsetWidth, h: t.offsetHeight });
    if (b.scrollWidth > b.clientWidth) b.scrollTo({ left: t.offsetLeft - (b.clientWidth - t.offsetWidth) / 2, behavior: REDUCED ? "auto" : "smooth" });
  }, [active]);
  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    if (!bar.current || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(bar.current);
    return () => ro.disconnect();
  }, [measure]);

  // Animate the panel height as the content changes.
  useLayoutEffect(() => {
    if (!inner.current || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(([e]) => setHeight(Math.round(e.target.getBoundingClientRect().height)));
    ro.observe(inner.current);
    return () => ro.disconnect();
  }, []);

  // Preload the other images once the first one is in.
  useEffect(() => {
    if (firstImg.current?.complete) setFirstLoaded(true);
  }, []);
  useEffect(() => {
    if (!firstLoaded) return;
    accelerators.forEach((a) => { const i = new Image(); i.src = a.image; });
  }, [firstLoaded]);

  const onKeyDown = (e) => {
    const move = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    let next;
    if (move) next = accelerators[(index + move + total) % total].id;
    else if (e.key === "Home") next = accelerators[0].id;
    else if (e.key === "End") next = accelerators[total - 1].id;
    if (!next) return;
    e.preventDefault();
    select(next, { focus: true });
  };

  return (
    <article className="prod feature acc-card" ref={card}>
      <span className="badge"><i />Home-grown solution</span>
      <h3 id={headingId}>Qlik Accelerators</h3>
      <p className="lead">Reusable, Meridanta-built components that speed up Qlik development, standardize implementation patterns, and improve consistency across analytics delivery.</p>

      <div className="ax-tabs" role="tablist" aria-label="Qlik accelerators" ref={bar} onKeyDown={onKeyDown}>
        {ind && <span className={"ax-ind"} style={{ width: ind.w, height: ind.h, transform: `translate(${ind.x}px, ${ind.y}px)` }} aria-hidden="true" />}
        {accelerators.map((a) => (
          <button
            key={a.id}
            id={`ax-tab-${a.id}`}
            type="button"
            role="tab"
            className="ax-tab"
            aria-selected={a.id === active}
            aria-controls="ax-panel"
            tabIndex={a.id === active ? 0 : -1}
            onClick={() => select(a.id)}
          >
            <Tile item={ACCELERATOR_STACK[a.id][0]} size={26} />
            {a.tab}
          </button>
        ))}
      </div>

      <div className="ax-body" style={height === null ? undefined : { height }}>
        <div ref={inner}>
          <div key={shown} id="ax-panel" role="tabpanel" aria-labelledby={`ax-tab-${shown}`} className={"ax-panel" + (out ? " is-out" : "")}>
            <div className="ax-cols">
              <div className="ax-col">
                <img ref={firstImg} className="ax-img" src={acc.image} width="1200" height="800" alt={acc.imageAlt} decoding="async" onLoad={() => setFirstLoaded(true)} />
                <div className="ax-built">
                  <p className="ax-h">Built with</p>
                  <ul>
                    {ACCELERATOR_STACK[acc.id].map((s) => (
                      <li key={s.label}><Tile item={s} size={40} /><span>{s.label}</span></li>
                    ))}
                  </ul>
                </div>
                <section className="ax-feats" aria-labelledby="ax-feat">
                  <p className="ax-h" id="ax-feat">Key features</p>
                  <ul className="ax-list">
                    {acc.features.map((t, i) => (
                      <li key={t}><span className="ax-ic ax-ic-lg"><CIcon name={FEATURE_ICONS[i % FEATURE_ICONS.length]} size={20} /></span><span>{t}</span></li>
                    ))}
                  </ul>
                </section>
              </div>
              <div className="ax-col">
                <div className="ax-head">
                  <h4 className="ax-title">{acc.title}</h4>
                  <p className="ax-tagline">{acc.tagline}</p>
                </div>
                <section className="ax-challenge" aria-labelledby="ax-ch">
                  <h5 id="ax-ch" className="ax-iconh"><span className="ax-ic"><CIcon name="target" size={18} /></span>Business challenge</h5>
                  <p>{acc.challenge}</p>
                </section>
                <section className="ax-solution" aria-labelledby="ax-so">
                  <h5 id="ax-so" className="ax-iconh"><span className="ax-ic"><CIcon name="solution" size={18} /></span>Solution</h5>
                  <ul className="ax-bullets">{acc.solution.map((t) => <li key={t}>{t}</li>)}</ul>
                </section>
                <section className="ax-bens" aria-labelledby="ax-ben">
                  <p className="ax-h" id="ax-ben">Benefits</p>
                  <ul className="ax-list ax-ben">
                    {acc.benefits.map((t, i) => (
                      <li key={t}><span className="ax-bic"><CIcon name={BENEFIT_ICONS[i % BENEFIT_ICONS.length]} size={22} /></span><span>{t}</span></li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>

            <div className="ax-foot">
              <AnimatedButton {...link("contact")}>Talk to us about this accelerator</AnimatedButton>
              <div className="ax-step">
                <button type="button" aria-label="Previous accelerator" onClick={() => select(accelerators[(index - 1 + total) % total].id)}><CIcon name="prev" size={18} strokeWidth={2.2} /></button>
                <span aria-live="polite">{index + 1} / {total}</span>
                <button type="button" aria-label="Next accelerator" onClick={() => select(accelerators[(index + 1) % total].id)}><CIcon name="next" size={18} strokeWidth={2.2} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ul className="ax-strip">
        {QLIK_BENEFITS.map(([t, d]) => <li key={t}>{I.check}<span><strong>{t}</strong>{d}</span></li>)}
      </ul>
      {seeAll && <a className="qlink" {...link("solutions")}>See all products and solutions {I.go}</a>}
    </article>
  );
}
