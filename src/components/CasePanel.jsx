import { useSectionLink } from "../nav";
import AnimatedButton from "./AnimatedButton";
import CaseDiagram from "./CaseDiagram";
import { CIcon } from "./caseIcons";

const BLOCKS = [
  { key: "challenge", n: "01", title: "Challenge", icon: "challenge" },
  { key: "solution", n: "02", title: "Solution", icon: "solution" },
  { key: "outcome", n: "03", title: "Outcome", icon: "outcome" },
  { key: "result", n: "04", title: "Result", icon: "result", hl: true },
];

/** One case study shown in full: the use case picture and stats on the left, the story on the right. */
export default function CasePanel({ study, vertical }) {
  const link = useSectionLink();
  const titleId = "ck-title-" + study.id;
  return (
    <div className="ck-panel-in">
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
        <ul className="ck-outs" aria-label="Outcomes">
          {study.outcomes.map((o) => <li key={o}><CIcon name={o} size={15} />{o}</li>)}
        </ul>

        <div className="ck-blocks">
          {BLOCKS.map((b) => (
            <section key={b.key} className={"ck-block" + (b.hl ? " is-hl" : "")} aria-labelledby={`${titleId}-${b.key}`}>
              <div className="ck-block-h">
                <span className="ck-bic"><CIcon name={b.icon} size={18} /></span>
                <h4 id={`${titleId}-${b.key}`}>{b.title}</h4>
                <span className="ck-n" aria-hidden="true">{b.n}</span>
              </div>
              <ul>{study[b.key].map((t) => <li key={t}>{t}</li>)}</ul>
            </section>
          ))}
        </div>

        <AnimatedButton variant="dark" className="ck-discuss" {...link("contact")}>Discuss a similar project</AnimatedButton>
      </div>
    </div>
  );
}
