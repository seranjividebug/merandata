import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { SERVICES, SERVICES_INTRO } from "../data";
import { I } from "./Icons";

const HOVER = "(hover: hover)";
const canHover = () => typeof window !== "undefined" && window.matchMedia(HOVER).matches;

const Plus = () => (
  <span className="sv-plus" aria-hidden="true">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
  </span>
);

function ServiceCard({ s, open, onToggle, onClose }) {
  const [kb, setKb] = useState(false);
  const listId = useId();
  const on = open || kb;
  return (
    <article
      className={"sv-card" + (on ? " is-on" : "")}
      onFocus={(e) => setKb(e.target.matches(":focus-visible"))}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) { setKb(false); onClose(); } }}
    >
      <button
        type="button"
        className="sv-toggle"
        aria-expanded={on}
        aria-controls={listId}
        aria-label={`${s.title}: ${s.tagline}`}
        onClick={(e) => { if (e.detail === 0 || !canHover()) onToggle(); }}
      />
      <span className="sv-bg" aria-hidden="true">{I[s.icon]}</span>
      <div className="sv-head">
        <span className="sv-ic">{I[s.icon]}</span>
        <div className="sv-titles">
          <p className="sv-pill">{s.n} · {s.title}</p>
          <h3>{s.tagline}</h3>
        </div>
      </div>
      <div className="sv-body">
        <p className="sv-desc">{s.short}</p>
        <ul className="sv-list" id={listId}>
          {s.items.map((t, i) => <li key={t} style={{ "--i": i }}>{t}</li>)}
        </ul>
      </div>
      {s.href && <Link className="sv-link" to={s.href}>Explore<span className="sr"> {s.title}</span><svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>}
      <Plus />
    </article>
  );
}

export function Services() {
  const [openIdx, setOpenIdx] = useState(-1);
  return (
    <section id="services" className="block" aria-labelledby="services-h">
      <div className="wrap">
        <div className="head sv-intro">
          <div className="rule" />
          <p className="sv-eyebrow">{SERVICES_INTRO.eyebrow}</p>
          <h2 id="services-h">{SERVICES_INTRO.tagline}</h2>
          {SERVICES_INTRO.lines.map((l) => <p key={l}>{l}</p>)}
        </div>
        <div className="sv-grid">
          {SERVICES.map((s, k) => (
            <ServiceCard
              key={s.title}
              s={s}
              open={openIdx === k}
              onToggle={() => setOpenIdx((cur) => (cur === k ? -1 : k))}
              onClose={() => setOpenIdx((cur) => (cur === k ? -1 : cur))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
