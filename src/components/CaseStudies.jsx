import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { caseStudies, FEATURED_CASE_IDS } from "../caseStudies";
import { REDUCED } from "../utils";
import CasePanel from "./CasePanel";
import { CIcon } from "./caseIcons";
import "../caseStudies.css";

const HASH_PREFIX = "case-";
const PUBLISHED = caseStudies.filter((c) => c.published);
const CATEGORY_ORDER = ["Real-Time Replication", "Modernization", "Migration & Upgrade", "Architecture & Performance"];
const CATEGORY_DOT = {
  "Real-Time Replication": "#EC5FAE",
  Modernization: "#9B4DA8",
  "Migration & Upgrade": "#42116F",
  "Architecture & Performance": "#E8A33D",
};
const rank = (c) => { const i = CATEGORY_ORDER.indexOf(c.category); return i < 0 ? CATEGORY_ORDER.length : i; };

/** Featured cases first (in their listed order), then the rest grouped by category in data order. */
const FEATURED = FEATURED_CASE_IDS.map((id) => PUBLISHED.find((c) => c.id === id)).filter(Boolean);
const REST = PUBLISHED.filter((c) => !FEATURED.includes(c))
  .map((c, i) => ({ c, i }))
  .sort((x, y) => rank(x.c) - rank(y.c) || x.i - y.i)
  .map((x) => x.c);
const LIST = [...FEATURED, ...REST];
const OUT_MS = 150;
const SWIPE_PX = 50;

const setHash = (id) => {
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, "", `${pathname}${search}#${HASH_PREFIX}${id}`);
};

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

/** Case studies: a jump strip on top, one case at a time in the panel, Previous / Next below. */
export default function CaseStudies({ headingLevel = 2 }) {
  const [index, setIndex] = useState(0); // target position in LIST
  const [shownId, setShownId] = useState(LIST[0].id); // case on screen (lags during the slide)
  const [out, setOut] = useState(false);
  const [dx, setDx] = useState(1);
  const [announce, setAnnounce] = useState("");
  const [height, setHeight] = useState(null);
  const [edge, setEdge] = useState({ left: false, right: false });
  const root = useRef(null);
  const strip = useRef(null);
  const slide = useRef(null);
  const timer = useRef(0);
  const touch = useRef(null);
  const at = useRef(0);
  const { hash, key } = useLocation();
  const vertical = useMedia("(max-width: 767px)");
  const H = `h${headingLevel}`;
  const study = LIST.find((s) => s.id === shownId);
  at.current = index;

  // Slide the current case out, then the new one in (instant for reduced motion).
  const goTo = useCallback((i, direction) => {
    const next = (i + LIST.length) % LIST.length;
    const dir = direction ?? (next >= at.current ? 1 : -1);
    at.current = next;
    setIndex(next);
    setDx(dir);
    const target = LIST[next];
    setAnnounce(`Case ${next + 1} of ${LIST.length}: ${target.title}`);
    setHash(target.id);
    window.clearTimeout(timer.current);
    if (REDUCED) { setShownId(target.id); setOut(false); return; }
    setOut(true);
    timer.current = window.setTimeout(() => { setShownId(target.id); setOut(false); }, OUT_MS);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const step = (d) => goTo(at.current + d, d);

  // Deep link: #case-<id> selects that case and scrolls the section into view.
  useLayoutEffect(() => {
    if (!hash.startsWith("#" + HASH_PREFIX)) return;
    const i = LIST.findIndex((s) => s.id === hash.slice(1 + HASH_PREFIX.length));
    if (i < 0) return;
    at.current = i;
    setIndex(i);
    setShownId(LIST[i].id);
    setOut(false);
    window.clearTimeout(timer.current);
    root.current?.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
  }, [hash, key]);

  // Animate the panel height as the case changes.
  useLayoutEffect(() => {
    if (!slide.current || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(([e]) => setHeight(Math.round(e.target.getBoundingClientRect().height)));
    ro.observe(slide.current);
    return () => ro.disconnect();
  }, [shownId]);

  // Strip: which edges can still scroll, and keep the active pill centred.
  const measure = useCallback(() => {
    const s = strip.current;
    if (!s) return;
    const left = s.scrollLeft > 4;
    const right = s.scrollLeft + s.clientWidth < s.scrollWidth - 4;
    setEdge((p) => (p.left === left && p.right === right ? p : { left, right }));
  }, []);
  useEffect(() => {
    const s = strip.current;
    measure();
    s.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => { s.removeEventListener("scroll", measure); window.removeEventListener("resize", measure); };
  }, [measure]);
  useEffect(() => {
    const s = strip.current;
    const pill = s?.querySelector('[aria-current="true"]');
    if (!pill) return;
    s.scrollTo({ left: pill.offsetLeft - (s.clientWidth - pill.offsetWidth) / 2, behavior: REDUCED ? "auto" : "smooth" });
  }, [index]);
  const scrollStrip = (dir) => strip.current?.scrollBy({ left: dir * strip.current.clientWidth * 0.8, behavior: REDUCED ? "auto" : "smooth" });

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
  };
  const onTouchStart = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
  const onTouchEnd = (e) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const mx = t.clientX - s.x;
    if (Math.abs(mx) > SWIPE_PX && Math.abs(mx) > Math.abs(t.clientY - s.y) * 1.5) step(mx < 0 ? 1 : -1);
  };

  return (
    <div id="case-studies" className="cases" ref={root} onKeyDown={onKeyDown}>
      <div className="cases-head">
        <p className="cases-eyebrow">OUR EXPERTISE</p>
        <H id="case-studies-h">Proven Outcomes</H>
        <p className="cases-intro">Real results from Qlik migrations, real-time replication and data modernization.</p>
      </div>
      <p className="sr" aria-live="polite">{announce}</p>

      <div className="ck-stripwrap">
        {edge.left && <button type="button" className="ck-sbtn ck-sbtn-l" aria-label="Scroll case studies left" onClick={() => scrollStrip(-1)}><CIcon name="prev" size={18} strokeWidth={2.4} /></button>}
        <div
          className="ck-strip"
          ref={strip}
          role="group"
          aria-label="Jump to a case study"
          style={{ "--fl": edge.left ? "56px" : "0px", "--fr": edge.right ? "56px" : "0px" }}
        >
          {LIST.map((s, i) => (
            <button key={s.id} type="button" className="ck-pill" aria-current={i === index ? "true" : undefined} onClick={() => goTo(i)}>
              <i style={{ background: CATEGORY_DOT[s.category] || "#9B4DA8" }} aria-hidden="true" />
              <span>{s.title}</span>
              <b>{s.highlight.value}</b>
            </button>
          ))}
        </div>
        {edge.right && <button type="button" className="ck-sbtn ck-sbtn-r" aria-label="Scroll case studies right" onClick={() => scrollStrip(1)}><CIcon name="next" size={18} strokeWidth={2.4} /></button>}
      </div>

      <div className="ck-panel" style={height === null ? undefined : { height }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div key={study.id} ref={slide} className={"ck-slide" + (out ? " is-out" : "")} style={{ "--dx": dx }}>
          <CasePanel study={study} vertical={vertical} />
        </div>
      </div>

      <div className="ck-nav">
        <div className="ck-pn">
          <button type="button" className="ck-arrow" aria-label="Previous case study" onClick={() => step(-1)}><CIcon name="prev" size={20} strokeWidth={2.2} /></button>
          <span className="ck-count">{index + 1} / {LIST.length}</span>
          <button type="button" className="ck-arrow" aria-label="Next case study" onClick={() => step(1)}><CIcon name="next" size={20} strokeWidth={2.2} /></button>
        </div>
        <div className="ck-progress" role="progressbar" aria-label="Position in the case studies" aria-valuemin={1} aria-valuemax={LIST.length} aria-valuenow={index + 1}>
          <span style={{ width: `${((index + 1) / LIST.length) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
