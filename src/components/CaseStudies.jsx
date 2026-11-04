import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { caseStudies, CASE_CATEGORIES, FEATURED_CASE_IDS } from "../caseStudies";
import { REDUCED } from "../utils";
import CasePanel from "./CasePanel";
import { CIcon } from "./caseIcons";
import "../caseStudies.css";

const HASH_PREFIX = "case-";
const PUBLISHED = caseStudies.filter((c) => c.published);
const CATEGORY_ORDER = ["Real-Time Replication", "Modernization", "Migration & Upgrade", "Architecture & Performance"];
const rank = (c) => { const i = CATEGORY_ORDER.indexOf(c.category); return i < 0 ? CATEGORY_ORDER.length : i; };

/** Featured cases first (in their listed order), then the rest grouped by category in data order. */
const FEATURED = FEATURED_CASE_IDS.map((id) => PUBLISHED.find((c) => c.id === id)).filter(Boolean);
const REST = PUBLISHED.filter((c) => !FEATURED.includes(c))
  .map((c, i) => ({ c, i }))
  .sort((x, y) => rank(x.c) - rank(y.c) || x.i - y.i)
  .map((x) => x.c);
const ORDERED = [...FEATURED, ...REST];
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

/** Case studies: one case at a time with Previous / Next, filters and a jump strip. */
export default function CaseStudies({ headingLevel = 2 }) {
  const [filter, setFilter] = useState("All");
  const [index, setIndex] = useState(0); // target position within the filtered list
  const [shownId, setShownId] = useState(ORDERED[0].id); // case on screen (lags during the slide)
  const [out, setOut] = useState(false);
  const [dx, setDx] = useState(1);
  const [announce, setAnnounce] = useState("");
  const root = useRef(null);
  const strip = useRef(null);
  const timer = useRef(0);
  const touch = useRef(null);
  const state = useRef({});
  const { hash, key } = useLocation();
  const vertical = useMedia("(max-width: 767px)");
  const H = `h${headingLevel}`;

  const counts = useMemo(() => Object.fromEntries(CASE_CATEGORIES.map((c) => [c, PUBLISHED.filter((s) => s.category === c).length])), []);
  const list = useMemo(() => (filter === "All" ? ORDERED : ORDERED.filter((s) => s.category === filter)), [filter]);
  const study = ORDERED.find((s) => s.id === shownId) || list[0];
  state.current = { list, index };

  // Slide the current case out, then the new one in (instant for reduced motion).
  const show = useCallback((id, direction) => {
    window.clearTimeout(timer.current);
    setDx(direction);
    const target = ORDERED.find((s) => s.id === id);
    setAnnounce(`Case ${state.current.list.findIndex((s) => s.id === id) + 1} of ${state.current.list.length}: ${target.title}`);
    setHash(id);
    if (REDUCED) { setShownId(id); setOut(false); return; }
    setOut(true);
    timer.current = window.setTimeout(() => { setShownId(id); setOut(false); }, OUT_MS);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const goTo = useCallback((i, direction) => {
    const { list: l, index: from } = state.current;
    const next = (i + l.length) % l.length;
    state.current = { list: l, index: next };
    setIndex(next);
    show(l[next].id, direction ?? (next >= from ? 1 : -1));
  }, [show]);
  const step = (d) => goTo(state.current.index + d, d);

  const choose = (name) => {
    if (name === filter) return;
    const l = name === "All" ? ORDERED : ORDERED.filter((s) => s.category === name);
    setFilter(name);
    setIndex(0);
    state.current = { list: l, index: 0 };
    show(l[0].id, 1);
  };

  // Deep link: #case-<id> selects that case and scrolls the section into view.
  useLayoutEffect(() => {
    if (!hash.startsWith("#" + HASH_PREFIX)) return;
    const id = hash.slice(1 + HASH_PREFIX.length);
    if (!ORDERED.some((s) => s.id === id)) return;
    const { list: current } = state.current;
    const inList = current.some((s) => s.id === id);
    const l = inList ? current : ORDERED;
    if (!inList) setFilter("All");
    setIndex(l.findIndex((s) => s.id === id));
    setShownId(id);
    setOut(false);
    window.clearTimeout(timer.current);
    root.current?.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
  }, [hash, key]);

  // Keep the active pill in view in the (sideways scrolling) strip.
  useEffect(() => {
    const bar = strip.current;
    const pill = bar?.querySelector('[aria-current="true"]');
    if (!pill) return;
    bar.scrollTo({ left: pill.offsetLeft - (bar.clientWidth - pill.offsetWidth) / 2, behavior: REDUCED ? "auto" : "smooth" });
  }, [index, filter]);

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
        <H id="case-studies-h">Case Studies</H>
        <p className="cases-intro">Real outcomes from Qlik migrations, real-time replication and data modernization projects.</p>
      </div>

      <div className="ck-filters" role="group" aria-label="Filter case studies by category">
        {["All", ...CASE_CATEGORIES].map((name) => (
          <button key={name} type="button" className="ck-chip" aria-pressed={filter === name} onClick={() => choose(name)}>
            {name} <span>({name === "All" ? PUBLISHED.length : counts[name]})</span>
          </button>
        ))}
      </div>
      <p className="sr" aria-live="polite">{announce}</p>

      <div className="ck-panel" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <div key={study.id} className={"ck-slide" + (out ? " is-out" : "")} style={{ "--dx": dx }}>
          <CasePanel study={study} vertical={vertical} />
        </div>
      </div>

      <div className="ck-nav">
        <div className="ck-pn">
          <button type="button" className="ck-arrow" aria-label="Previous case study" onClick={() => step(-1)}><CIcon name="prev" size={20} strokeWidth={2.2} /></button>
          <span className="ck-count">{index + 1} / {list.length}</span>
          <button type="button" className="ck-arrow" aria-label="Next case study" onClick={() => step(1)}><CIcon name="next" size={20} strokeWidth={2.2} /></button>
        </div>
        <div className="ck-progress" role="progressbar" aria-label="Position in the case studies" aria-valuemin={1} aria-valuemax={list.length} aria-valuenow={index + 1}>
          <span style={{ width: `${((index + 1) / list.length) * 100}%` }} />
        </div>
      </div>

      <div className="ck-strip" ref={strip} role="group" aria-label="Jump to a case study">
        {list.map((s, i) => (
          <button key={s.id} type="button" className="ck-pill" aria-current={i === index ? "true" : undefined} onClick={() => goTo(i)}>
            <span>{s.title}</span><b>{s.highlight.value}</b>
          </button>
        ))}
      </div>
    </div>
  );
}
