import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { caseImpact, caseStudies, CASE_CATEGORIES, FEATURED_CASE_IDS } from "../caseStudies";
import { REDUCED } from "../utils";
import CaseCard from "./CaseCard";
import CaseModal from "./CaseModal";
import "../caseStudies.css";

const FIRST = 6;
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

const setHash = (hash) => {
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, "", pathname + search + hash);
};

/** Case studies: impact strip, category filters, card grid and the detail dialog. */
export default function CaseStudies({ headingLevel = 2 }) {
  const [filter, setFilter] = useState("All");
  const [showAll, setShowAll] = useState(false);
  const [openId, setOpenId] = useState(null);
  const origin = useRef({ button: null, card: null });
  const grid = useRef(null);
  const { hash, key } = useLocation();
  const H = `h${headingLevel}`;

  const counts = useMemo(() => Object.fromEntries(CASE_CATEGORIES.map((c) => [c, PUBLISHED.filter((s) => s.category === c).length])), []);
  const filtered = useMemo(() => (filter === "All" ? ORDERED : ORDERED.filter((s) => s.category === filter)), [filter]);
  const shown = showAll ? filtered : filtered.slice(0, FIRST);
  const active = ORDERED.find((s) => s.id === openId) || null;
  const navList = active && filtered.some((s) => s.id === active.id) ? filtered : ORDERED;

  const choose = (name) => { setFilter(name); setShowAll(false); };

  const open = useCallback((id, button, card) => {
    origin.current = { button, card };
    setOpenId(id);
    setHash("#" + HASH_PREFIX + id);
  }, []);

  const select = (id) => {
    setOpenId(id);
    setHash("#" + HASH_PREFIX + id);
    origin.current = { button: null, card: null };
  };

  const refocus = useRef(null);
  const close = useCallback(({ restoreFocus }) => {
    refocus.current = restoreFocus ? openId : null;
    setOpenId(null);
    setHash("");
  }, [openId]);

  // Once the dialog is gone (and the page is no longer inert): back to the card that opened it
  // (or the card now showing, after Previous / Next).
  useEffect(() => {
    if (openId !== null || !refocus.current) return;
    const id = refocus.current;
    refocus.current = null;
    const el = origin.current.button?.isConnected ? origin.current.button : document.querySelector(`[data-case-id="${id}"] .ck-plus`);
    (el || document.querySelector(".ck-chip"))?.focus();
  }, [openId]);

  // Deep link: #case-<id> scrolls to the section and opens that case.
  useEffect(() => {
    if (!hash.startsWith("#" + HASH_PREFIX)) return;
    const id = hash.slice(1 + HASH_PREFIX.length);
    if (!PUBLISHED.some((s) => s.id === id)) return;
    document.getElementById("case-studies")?.scrollIntoView({ block: "start" });
    origin.current = { button: null, card: null };
    setOpenId(id);
  }, [hash, key]);

  const toggleAll = () => {
    if (showAll) {
      setShowAll(false);
      grid.current?.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
    } else setShowAll(true);
  };

  return (
    <div id="case-studies" className="cases">
      <div className="cases-head">
        <p className="cases-eyebrow">OUR EXPERTISE</p>
        <H id="case-studies-h">Case Studies</H>
        <p className="cases-intro">Real outcomes from Qlik migrations, real-time replication and data modernization projects.</p>
      </div>

      <dl className="impact">
        {caseImpact.map((s) => (
          <div key={s.label}><dt>{s.label}</dt><dd>{s.value}</dd></div>
        ))}
      </dl>

      <div className="ck-filters" role="group" aria-label="Filter case studies by category">
        {["All", ...CASE_CATEGORIES].map((name) => (
          <button key={name} type="button" className="ck-chip" aria-pressed={filter === name} onClick={() => choose(name)}>
            {name} <span>({name === "All" ? PUBLISHED.length : counts[name]})</span>
          </button>
        ))}
      </div>
      <p className="sr" role="status">Showing {shown.length} of {filtered.length} case studies</p>

      <div className="ck-grid" ref={grid} key={filter}>
        {shown.map((s) => <CaseCard key={s.id} study={s} onOpen={open} />)}
      </div>

      {filtered.length > FIRST && (
        <div className="ck-more">
          <button type="button" className="btn btn-dark" onClick={toggleAll} aria-expanded={showAll}>
            {showAll ? "Show less" : "View all case studies"}
          </button>
        </div>
      )}

      {active && <CaseModal study={active} list={navList} originCard={origin.current.card} onSelect={select} onClose={close} />}
    </div>
  );
}
