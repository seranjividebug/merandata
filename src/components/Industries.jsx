import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { INDUSTRIES } from "../data";
import { useSectionLink } from "../nav";
import { I, SectionHead } from "./Icons";
import "../industries.css";
import { INDUSTRY_ART } from "./IndustryArt";

const POINT_ICONS = [I.challenge, I.opportunity, I.capability];
const HOVER_DESKTOP = "(hover: hover) and (min-width: 1024px)";
const canHover = () => typeof window !== "undefined" && window.matchMedia(HOVER_DESKTOP).matches;

function IndustryCard({ d, side, state, open, onToggle, onEnter }) {
  const base = useId();
  const link = useSectionLink();
  const Art = INDUSTRY_ART[d.key];
  return (
    <article
      className={"ic-card" + (state === "open" ? " is-open" : "") + (state === "collapsed" ? " is-collapsed" : "")}
      data-side={side}
      onMouseEnter={onEnter}
    >
      <button type="button" className="ic-toggle" aria-expanded={open} aria-controls={base} aria-label={`${d.eyebrow}: ${d.cardTitle}`} onClick={onToggle} />
      <div className="ic-in" id={base}>
        <div className="ic-left">
          <div className="ic-art"><Art /></div>
          <p className="ic-eyebrow">{d.eyebrow}</p>
          <h3 className="ic-title">{d.cardTitle}</h3>
          <p className="ic-desc">{d.cardDesc}</p>
        </div>
        <div className="ic-right">
          <ul className="ic-pts">
            {d.points.map(([label, text], i) => (
              <li key={label} className="ic-pt">
                <span className={"mk" + (i === 2 ? " mk-grad" : "")}>{POINT_ICONS[i]}</span>
                <div><h4>{label}</h4><p>{text}</p></div>
              </li>
            ))}
          </ul>
        </div>
        <div className="ic-actions">
          <Link className="btn btn-grad" to={"/industries/" + d.slug + "/"}>Learn More<span className="sr"> about {d.tab}</span></Link>
          <a className="btn btn-outline" {...link("contact")}>Talk to Our Team</a>
        </div>
      </div>
    </article>
  );
}

export default function Industries() {
  const [open, setOpen] = useState(-1);

  const toggle = (i) => (e) => {
    // Keyboard clicks (detail 0) and touch devices toggle; a mouse click just keeps the hovered card open.
    if (e.detail === 0 || !canHover()) setOpen((cur) => (cur === i ? -1 : i));
    else setOpen(i);
  };

  return (
    <section id="industries" className="block" aria-labelledby="ind-h">
      <div className="wrap">
        <SectionHead id="ind-h" title="Industries We Serve" intro="We apply AI, data, analytics, and modern technology capabilities to the needs of complex, data-driven industries." />
        <div
          className={"ic-row" + (open >= 0 ? " has-open" : "")}
          onMouseLeave={() => { if (canHover()) setOpen(-1); }}
          onKeyDown={(e) => { if (e.key === "Escape") setOpen(-1); }}
        >
          {INDUSTRIES.map((d, i) => (
            <IndustryCard
              key={d.key}
              d={d}
              side={i === 0 ? "left" : "right"}
              state={open < 0 ? "default" : open === i ? "open" : "collapsed"}
              open={open === i}
              onToggle={toggle(i)}
              onEnter={() => { if (canHover()) setOpen(i); }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
