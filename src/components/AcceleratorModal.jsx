import { useEffect, useRef } from "react";
import { accelerators } from "../accelerators";
import { useSectionLink } from "../nav";
import Modal from "./Modal";
import { CIcon } from "./caseIcons";
import "../accelerators.css";

// Icon order follows the source slides.
const FEATURE_ICONS = ["chart", "updown", "gauge", "challenge", "bell"];
const BENEFIT_ICONS = ["clock", "eye", "gear", "bell", "outcome"];

/** Detail dialog for one Qlik accelerator, with a tab bar to move between all of them. */
export default function AcceleratorModal({ activeId, origin, onSelect, onClose }) {
  const link = useSectionLink();
  const tabs = useRef(null);
  const index = accelerators.findIndex((a) => a.id === activeId);
  const acc = accelerators[index];
  const total = accelerators.length;

  const select = (id, focusTab) => {
    onSelect(id);
    if (focusTab) requestAnimationFrame(() => tabs.current?.querySelector(`#acc-tab-${id}`)?.focus());
  };
  // Left / right arrows move between tabs (and keep focus on the tab bar if it was there).
  const step = (dir) => select(accelerators[(index + dir + total) % total].id, tabs.current?.contains(document.activeElement));

  // Keep the active tab in view in the (sideways scrolling) tab bar.
  useEffect(() => {
    tabs.current?.querySelector(`#acc-tab-${activeId}`)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeId]);

  return (
    <Modal dark labelledBy="acc-title" closeLabel="Close accelerator" origin={origin} onClose={onClose} onArrow={step}>
      {({ close }) => (
        <>
          <div className="ac-tabs" role="tablist" aria-label="Qlik accelerators" ref={tabs}>
            {accelerators.map((a) => (
              <button
                key={a.id}
                id={`acc-tab-${a.id}`}
                type="button"
                role="tab"
                className="ac-tab"
                aria-selected={a.id === activeId}
                aria-controls="acc-panel"
                tabIndex={a.id === activeId ? 0 : -1}
                onClick={() => select(a.id)}
              >
                {a.tab}
              </button>
            ))}
          </div>

          <div className="cm-scroll ac-scroll">
            <div key={acc.id} id="acc-panel" role="tabpanel" aria-labelledby={`acc-tab-${acc.id}`} className="ac-panel">
              <header className="ac-head">
                <span className="badge"><i />Home-grown accelerator</span>
                <h2 id="acc-title">{acc.title}</h2>
                <p className="ac-tag">{acc.tagline}</p>
              </header>

              <div className="ac-row">
                <img className="ac-img" src={acc.image} width="1200" height="800" alt={acc.imageAlt} decoding="async" />
                <div className="ac-copy">
                  <section aria-labelledby="acc-ch">
                    <h3 id="acc-ch"><span className="ac-ic"><CIcon name="target" size={18} /></span>Business challenge</h3>
                    <p>{acc.challenge}</p>
                  </section>
                  <section aria-labelledby="acc-so">
                    <h3 id="acc-so"><span className="ac-ic"><CIcon name="solution" size={18} /></span>Solution</h3>
                    <ul>{acc.solution.map((t) => <li key={t}>{t}</li>)}</ul>
                  </section>
                </div>
              </div>

              <section aria-labelledby="acc-feat">
                <h3 className="ac-sub" id="acc-feat">Key features</h3>
                <ul className="ac-features">
                  {acc.features.map((t, i) => (
                    <li key={t}><span className="ac-ic ac-ic-lg"><CIcon name={FEATURE_ICONS[i % FEATURE_ICONS.length]} size={20} /></span><span>{t}</span></li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby="acc-ben">
                <h3 className="ac-sub" id="acc-ben">Benefits</h3>
                <ul className="ac-benefits">
                  {acc.benefits.map((t, i) => (
                    <li key={t}><span className="ac-bic"><CIcon name={BENEFIT_ICONS[i % BENEFIT_ICONS.length]} size={22} /></span><span>{t}</span></li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          <footer className="cm-foot">
            <a className="btn btn-grad" {...link("contact", () => close(false, true))}>Talk to us about this accelerator</a>
            <div className="cm-nav">
              <button type="button" className="cm-arrow" aria-label="Previous accelerator" onClick={() => step(-1)}><CIcon name="prev" size={20} strokeWidth={2.2} /></button>
              <span className="cm-count" aria-live="polite">{index + 1} / {total}</span>
              <button type="button" className="cm-arrow" aria-label="Next accelerator" onClick={() => step(1)}><CIcon name="next" size={20} strokeWidth={2.2} /></button>
            </div>
          </footer>
        </>
      )}
    </Modal>
  );
}
