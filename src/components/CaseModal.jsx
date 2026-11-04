import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSectionLink } from "../nav";
import { REDUCED } from "../utils";
import CaseDiagram from "./CaseDiagram";
import { CIcon } from "./caseIcons";

const BLOCKS = [
  { key: "challenge", n: "01", title: "Challenge", icon: "challenge" },
  { key: "solution", n: "02", title: "Solution", icon: "solution" },
  { key: "outcome", n: "03", title: "Outcome", icon: "outcome" },
  { key: "result", n: "04", title: "Result", icon: "result", hl: true },
];
const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';
const DURATION = 300;

/** Transform that places the dialog over the card it came from. */
function fromCard(dialog, card) {
  const to = dialog.getBoundingClientRect();
  if (!card || !to.width) return "translateY(16px) scale(.96)";
  const from = card.getBoundingClientRect();
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})`;
}

/**
 * Case study detail dialog. `onClose({ restoreFocus })` is called after the exit animation.
 * `list` is the navigation order for Previous / Next.
 */
export default function CaseModal({ study, list, originCard, onSelect, onClose }) {
  const dialog = useRef(null);
  const backdrop = useRef(null);
  const scroller = useRef(null);
  const closing = useRef(false);
  const downOnBackdrop = useRef(false);
  const link = useSectionLink();
  const index = list.findIndex((s) => s.id === study.id);
  const total = list.length;

  const animate = (reverse, done) => {
    const d = dialog.current;
    const b = backdrop.current;
    if (!d || !b || REDUCED || typeof d.animate !== "function") { done?.(); return; }
    const hidden = fromCard(d, originCard);
    const opts = { duration: reverse ? 220 : DURATION, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" };
    const frames = [{ transform: hidden, opacity: 0.2 }, { transform: "none", opacity: 1 }];
    const a = d.animate(reverse ? [...frames].reverse() : frames, opts);
    const fade = [{ opacity: 0 }, { opacity: 1 }];
    b.animate(reverse ? [...fade].reverse() : fade, { ...opts, easing: "ease", fill: "both" });
    if (done) a.onfinish = done;
  };

  const close = (restoreFocus = true, instant = false) => {
    if (closing.current) return;
    closing.current = true;
    if (instant) onClose({ restoreFocus });
    else animate(true, () => onClose({ restoreFocus }));
  };

  // Open: scale up from the card, then focus the close button.
  useLayoutEffect(() => {
    animate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { dialog.current?.querySelector(".cm-x")?.focus({ preventScroll: true }); }, []);

  // New case: back to the top of the scroll area.
  useEffect(() => { if (scroller.current) scroller.current.scrollTop = 0; }, [study.id]);

  const step = (dir) => { if (total > 1) onSelect(list[(index + dir + total) % total].id); };

  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); return; }
    if (e.key !== "Tab") return;
    const items = [...dialog.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  const discuss = link("contact", () => close(false, true));
  const titleId = "cm-title-" + study.id;

  return createPortal(
    <div
      className="cm-root"
      onKeyDown={onKeyDown}
      onMouseDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (e.target === e.currentTarget && downOnBackdrop.current) close(); }}
    >
      <div className="cm-backdrop" ref={backdrop} aria-hidden="true" />
      <div className="cm-dialog" ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button type="button" className="cm-x" aria-label="Close case study" onClick={() => close()}><CIcon name="close" size={22} strokeWidth={2.2} /></button>
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
          <a className="btn btn-grad" {...discuss}>Discuss a similar project</a>
          <div className="cm-nav">
            <button type="button" className="cm-arrow" aria-label="Previous case study" onClick={() => step(-1)} disabled={total < 2}><CIcon name="prev" size={20} strokeWidth={2.2} /></button>
            <span className="cm-count" aria-live="polite">{index + 1} / {total}</span>
            <button type="button" className="cm-arrow" aria-label="Next case study" onClick={() => step(1)} disabled={total < 2}><CIcon name="next" size={20} strokeWidth={2.2} /></button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
