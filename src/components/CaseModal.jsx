import { useEffect, useRef } from "react";
import { useSectionLink } from "../nav";
import CaseDiagram from "./CaseDiagram";
import Modal from "./Modal";
import { CIcon } from "./caseIcons";

const BLOCKS = [
  { key: "challenge", n: "01", title: "Challenge", icon: "challenge" },
  { key: "solution", n: "02", title: "Solution", icon: "solution" },
  { key: "outcome", n: "03", title: "Outcome", icon: "outcome" },
  { key: "result", n: "04", title: "Result", icon: "result", hl: true },
];
/**
 * Case study detail dialog. `onClose({ restoreFocus })` is called after the exit animation.
 * `list` is the navigation order for Previous / Next.
 */
export default function CaseModal({ study, list, originCard, onSelect, onClose }) {
  const scroller = useRef(null);
  const link = useSectionLink();
  const index = list.findIndex((s) => s.id === study.id);
  const total = list.length;

  // New case: back to the top of the scroll area.
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = 0; }, [study.id]);

  const step = (dir) => { if (total > 1) onSelect(list[(index + dir + total) % total].id); };

  const titleId = "cm-title-" + study.id;

  return (
    <Modal labelledBy={titleId} closeLabel="Close case study" origin={originCard} onClose={onClose} onArrow={step}>
      {({ close }) => (
        <>
        <div className="cm-scroll" ref={scroller}>
          <div key={study.id} className="cm-content">
            <header className="cm-head">
              <div className="cm-meta">
                <span className="ck-tag">{study.category}</span>
                <span className="cm-aud">{study.audience}</span>
              </div>
              <h2 id={titleId}>{study.title}</h2>
              <p className="cm-sum">{study.summary}</p>
            </header>

            <ul className="cm-stats" aria-label="Key numbers">
              {study.stats.map((s) => (
                <li key={s.label}><strong>{s.value}</strong><span>{s.label}</span></li>
              ))}
            </ul>

            <h3 className="cm-sub">Use case picture</h3>
            <CaseDiagram diagram={study.diagram} title={study.title} />

            <div className="cm-blocks">
              {BLOCKS.map((b) => (
                <section key={b.key} className={"cm-block" + (b.hl ? " is-hl" : "")} aria-labelledby={`${titleId}-${b.key}`}>
                  <div className="cm-block-h">
                    <span className="cm-ic"><CIcon name={b.icon} size={20} /></span>
                    <h3 id={`${titleId}-${b.key}`}>{b.title}</h3>
                    <span className="cm-n" aria-hidden="true">{b.n}</span>
                  </div>
                  <ul>{study[b.key].map((t) => <li key={t}>{t}</li>)}</ul>
                </section>
              ))}
            </div>
          </div>
        </div>
        <footer className="cm-foot">
          <a className="btn btn-grad" {...link("contact", () => close(false, true))}>Discuss a similar project</a>
          <div className="cm-nav">
            <button type="button" className="cm-arrow" aria-label="Previous case study" onClick={() => step(-1)} disabled={total < 2}><CIcon name="prev" size={20} strokeWidth={2.2} /></button>
            <span className="cm-count" aria-live="polite">{index + 1} / {total}</span>
            <button type="button" className="cm-arrow" aria-label="Next case study" onClick={() => step(1)} disabled={total < 2}><CIcon name="next" size={20} strokeWidth={2.2} /></button>
          </div>
        </footer>
        </>
      )}
    </Modal>
  );
}
