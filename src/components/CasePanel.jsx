import { useRef, useState } from "react";
import { useSectionLink } from "../nav";
import AnimatedButton from "./AnimatedButton";
import CaseDiagram from "./CaseDiagram";
import { CIcon } from "./caseIcons";

const BLOCKS = [
  { key: "challenge", title: "Challenge" },
  { key: "solution", title: "Solution" },
  { key: "outcome", title: "Outcome" },
  { key: "result", title: "Result", hl: true },
];

/**
 * One case study: the use case picture and stats on the left, the story on the right.
 * The four story blocks are a tab control showing one block at a time (it resets to Challenge
 * whenever the case changes, because the parent remounts this panel per case).
 */
export default function CasePanel({ study, vertical }) {
  const link = useSectionLink();
  const [tab, setTab] = useState(0);
  const list = useRef(null);
  const id = "ck-" + study.id;
  const block = BLOCKS[tab];

  const onKeyDown = (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    e.stopPropagation(); // arrows move between tabs here, not between cases
    const next = (tab + d + BLOCKS.length) % BLOCKS.length;
    setTab(next);
    requestAnimationFrame(() => list.current?.querySelector(`#${id}-tab-${next}`)?.focus());
  };

  return (
    <div className="ck-panel-in">
      <div className="ck-left">
        <CaseDiagram diagram={study.diagram} title={study.title} vertical={vertical} compact />
        <ul className="ck-stats" aria-label="Key numbers">
          {study.stats.map((s) => (
            <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>
          ))}
        </ul>
      </div>

      <div className="ck-right">
        <div className="ck-meta">
          <span className="ck-tag">{study.category}</span>
          <span className="ck-aud">{study.audience}</span>
        </div>
        <h3 className="ck-name" id={id + "-t"}>{study.title}</h3>
        <p className="ck-summary" title={study.summary}>{study.summary}</p>
        <ul className="ck-outs" aria-label="Outcomes">
          {study.outcomes.map((o) => <li key={o}><CIcon name={o} size={14} />{o}</li>)}
        </ul>

        <div className="ck-tabs" role="tablist" aria-label="Case study details" ref={list} onKeyDown={onKeyDown}>
          {BLOCKS.map((b, i) => (
            <button
              key={b.key}
              id={`${id}-tab-${i}`}
              type="button"
              role="tab"
              className={"ck-tab" + (b.hl ? " is-hl" : "")}
              aria-selected={i === tab}
              aria-controls={id + "-panel"}
              tabIndex={i === tab ? 0 : -1}
              onClick={() => setTab(i)}
            >
              {b.title}
            </button>
          ))}
        </div>
        <div className="ck-tabarea" id={id + "-panel"} role="tabpanel" aria-labelledby={`${id}-tab-${tab}`} tabIndex={0}>
          <ul key={block.key} className="ck-bullets">{study[block.key].map((t) => <li key={t}>{t}</li>)}</ul>
        </div>

        <AnimatedButton variant="dark" className="ck-discuss" {...link("contact")}>Discuss a similar project</AnimatedButton>
      </div>
    </div>
  );
}
