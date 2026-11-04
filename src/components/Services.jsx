import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { SERVICES } from "../data";
import { I, SectionHead } from "./Icons";

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
        aria-label={s.title}
        onClick={(e) => { if (e.detail === 0 || !canHover()) onToggle(); }}
      />
      <span className="sv-bg" aria-hidden="true">{I[s.icon]}</span>
      <div className="sv-head">
        <span className="sv-ic">{I[s.icon]}</span>
        <h3>{s.title}</h3>
      </div>
      <div className="sv-body">
        <p className="sv-desc">{s.short}</p>
        <ul className="sv-list" id={listId}>
          {s.items.map((t, i) => <li key={t} style={{ "--i": i }}>{t}</li>)}
        </ul>
      </div>
      {s.href && <Link className="sv-link" to={s.href}>Explore Qlik<svg viewBox="0 0 14 14" width="12" height="12" fill="none" aria-hidden="true"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></Link>}
      <Plus />
    </article>
  );
}

export function Services() {
  const [openIdx, setOpenIdx] = useState(-1);
  return (
    <section id="services" className="block" aria-labelledby="services-h">
      <div className="wrap">
        <SectionHead id="services-h" title="What We Do" intro="Meridanta brings together technology expertise and practical delivery to help organizations modernize, innovate, and achieve measurable business outcomes, with an AI-first approach." />
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
