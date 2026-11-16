import { useState } from "react";
import { useSectionLink } from "../nav";
import AnimatedButton from "./AnimatedButton";
import CaseDiagram from "./CaseDiagram";

const BLOCKS = [
  { key: "challenge", n: "01", title: "Challenge", icon: "challenge" },
  { key: "solution", n: "02", title: "Solution", icon: "solution" },
  { key: "outcome", n: "03", title: "Outcome", icon: "outcome" },
  { key: "result", n: "04", title: "Result", icon: "result", hl: true },
];

/**
 * One case study shown in full: the use case picture and stats on the left, the story on the right.
 * All four story sections are in the markup; only the selected tab's section is visible.
 */
export default function CasePanel({ study, vertical }) {
  const link = useSectionLink();
  const titleId = "ck-title-" + study.id;
  const [tab, setTab] = useState(BLOCKS[0].key);
  const onTabKey = (e) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    const i = BLOCKS.findIndex((b) => b.key === tab);
    const next = BLOCKS[(i + d + BLOCKS.length) % BLOCKS.length].key;
    setTab(next);
    document.getElementById(`${titleId}-tab-${next}`)?.focus();
  };
  return (
    <article className="ck-panel-in" aria-labelledby={titleId}>
      <div className="ck-left">
        <CaseDiagram diagram={study.diagram} title={study.title} vertical={vertical} />
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
        <h3 className="ck-name" id={titleId}>{study.title}</h3>
        <p className="ck-summary">{study.summary}</p>

        <div className="ck-tabs" role="tablist" aria-label="Case study detail" onKeyDown={onTabKey}>
          {BLOCKS.map((b) => (
            <button
              key={b.key}
              type="button"
              role="tab"
              id={`${titleId}-tab-${b.key}`}
              aria-selected={tab === b.key}
              aria-controls={`${titleId}-pane-${b.key}`}
              tabIndex={tab === b.key ? 0 : -1}
              className="ck-tab"
              onClick={() => setTab(b.key)}
            >{b.title}</button>
          ))}
        </div>
        {BLOCKS.map((b) => (
          <div
            key={b.key}
            className="ck-pane"
            role="tabpanel"
            id={`${titleId}-pane-${b.key}`}
            aria-labelledby={`${titleId}-tab-${b.key}`}
            tabIndex={0}
            hidden={tab !== b.key}
          >
            <ul>{study[b.key].map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
        ))}

        <AnimatedButton variant="dark" className="ck-discuss" {...link("contact")}>Discuss a similar project</AnimatedButton>
      </div>
    </article>
  );
}

/** Full text of a case study that is not currently on screen. Hidden with CSS but always present in the HTML. */
export function CaseText({ study }) {
  const id = "ck-text-" + study.id;
  return (
    <article aria-labelledby={id}>
      <h3 id={id}>{study.title}</h3>
      <p>{study.category}. {study.audience}</p>
      <p>{study.summary}</p>
      <ul aria-label="Key numbers">
        {study.stats.map((s) => <li key={s.label}>{s.value} {s.label}</li>)}
      </ul>
      {BLOCKS.map((b) => (
        <section key={b.key}>
          <h4>{b.title}</h4>
          <ul>{study[b.key].map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
      ))}
    </article>
  );
}
