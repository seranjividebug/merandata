import { useCallback, useEffect, useRef, useState } from "react";
import { I } from "./Icons";
import { useSectionLink } from "../nav";
import RailArt from "./railArt";
import { useAttachedPreview, useBottomSheet, useRailEdges, useRailEnvironment } from "./railHooks";
import "../rail.css";

const INTENT_MS = 250; // hover intent delay

/** Where the preview panel goes: directly under the card, as wide as the card, kept inside the window. */
function placement(wrap) {
  const r = wrap.getBoundingClientRect();
  const left = Math.max(8, Math.min(r.left, window.innerWidth - 8 - r.width));
  return { left, top: r.bottom, width: r.width };
}

/** One card: illustration, title, description (when there is one) and the arrow button; plus its preview, which is in the HTML all the time and only shown when opened. */
function RailCard({ card, index, sectionId, tagline, isOpen, sheet, panelStyle, handlers, sheetRef, onOpenButton, onClose, link }) {
  const pid = `${sectionId}-pv-${index}`;
  const opened = isOpen && sheet;
  return (
    <li className={"rail-item" + (isOpen ? " is-open" : "")} {...handlers}>
      <div className="rail-pw">
        <div className="rail-poster">
          <div className="rail-media">
            <RailArt id={`${sectionId}-${index}`} i={index} art={card.art} />
            <span className="rail-num" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <div className="rail-body">
            <div className="rail-txt">
              <h3 className="rail-name">{card.title}</h3>
              {card.desc && <p className="rail-text">{card.desc}</p>}
            </div>
            <button type="button" className="rail-go" aria-label={`More about ${card.title}`} aria-expanded={isOpen} aria-controls={pid} onClick={onOpenButton}>
              {I.next}
            </button>
          </div>
        </div>
      </div>
      {opened && <div className="rail-backdrop" onClick={onClose} aria-hidden="true" />}
      <div
        id={pid}
        ref={opened ? sheetRef : null}
        className={"rail-pv" + (isOpen ? (sheet ? " is-sheet" : " is-panel") : "")}
        role={isOpen ? (sheet ? "dialog" : "group") : undefined}
        aria-modal={opened ? "true" : undefined}
        aria-label={isOpen ? card.title : undefined}
        style={panelStyle}
        {...(opened ? sheetHandlers(onClose) : {})}
      >
        {opened && (
          <div className="rail-sheet-bar">
            <span className="rail-grip" aria-hidden="true" />
            <button type="button" className="rail-x" aria-label="Close preview" onClick={onClose}>{I.close}</button>
          </div>
        )}
        <div className="rail-pv-title" aria-hidden="true">{card.title}</div>
        {!card.desc && <p className="rail-desc">{tagline}</p>}
        {card.bullets?.length > 0 && <ul>{card.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
        <a className="rail-chip" tabIndex={isOpen ? 0 : -1} {...link("contact")}>Discuss <span aria-hidden="true">→</span></a>
      </div>
    </li>
  );
}

/** Swipe down on the sheet to close it. */
function sheetHandlers(close) {
  let startY = 0;
  return {
    onTouchStart: (e) => { startY = e.touches[0].clientY; },
    onTouchEnd: (e) => { if (e.changedTouches[0].clientY - startY > 70) close(); },
  };
}

/**
 * Rail of illustrated cards for a service page's capabilities. Every title, description and bullet is in the page HTML
 * (the previews are visually hidden until opened). Desktop: hover or focus opens a preview under the card (position:fixed,
 * so the scrolling row never clips it and nothing shifts). Phones and touch: tapping a card opens the same preview as a
 * bottom sheet. Screens from tablet width up show the cards as a grid; phones get a swipeable row.
 */
export default function CapabilityRail({ section, tagline }) {
  const { id, title, cards } = section;
  const link = useSectionLink();
  const railRef = useRef(null);
  const timer = useRef(0);
  const sheetRef = useRef(null);
  const lastFocus = useRef(null);
  const skipFocus = useRef(false); // set while focus is moved back to a card button after Esc, so it does not reopen
  const [open, setOpen] = useState(-1);
  const [pos, setPos] = useState(null);
  const { mode, reduced } = useRailEnvironment();
  const edge = useRailEdges(railRef);
  const sheet = mode === "sheet";

  const place = useCallback((i) => {
    const wrap = railRef.current?.querySelectorAll(".rail-pw")[i];
    if (wrap) setPos(placement(wrap));
  }, []);
  const openAt = useCallback((i) => { place(i); setOpen(i); }, [place]);
  const close = useCallback(() => { window.clearTimeout(timer.current); setOpen(-1); }, []);
  useAttachedPreview(open, mode, railRef, place, close);
  useBottomSheet(open, mode, sheetRef, lastFocus, close);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const scrollByPage = (dir) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduced ? "auto" : "smooth" });
  };

  // Arrow keys move between the card buttons; Esc closes a desktop preview and keeps focus on its button.
  const onKeyDown = (e) => {
    if (e.key === "Escape" && mode === "hover" && open >= 0) {
      const n = open;
      close();
      skipFocus.current = true;
      railRef.current?.querySelectorAll(".rail-go")[n]?.focus();
      skipFocus.current = false;
      return;
    }
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const buttons = [...railRef.current.querySelectorAll(".rail-go")];
    const at = buttons.indexOf(document.activeElement);
    if (at < 0) return;
    e.preventDefault();
    buttons[Math.max(0, Math.min(buttons.length - 1, at + (e.key === "ArrowRight" ? 1 : -1)))].focus();
  };

  const handlersFor = (i) => ({
    onPointerEnter: (e) => {
      if (mode !== "hover" || e.pointerType !== "mouse") return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => openAt(i), reduced ? 0 : INTENT_MS);
    },
    onPointerLeave: (e) => { if (mode === "hover" && e.pointerType === "mouse") close(); },
    onFocus: (e) => { if (mode === "hover" && !skipFocus.current && e.target.matches(":focus-visible") && e.target.classList.contains("rail-go")) openAt(i); },
    onBlur: (e) => { if (mode === "hover" && !e.currentTarget.contains(e.relatedTarget)) close(); },
  });

  return (
    <section id={id} className="rail-sec" aria-labelledby={`${id}-h`}>
      <div className="wrap">
        <div className="rail-head">
          <h2 id={`${id}-h`}>{title}</h2>
          <span className="rail-count">{cards.length} capabilities</span>
          <div className="rail-arrows">
            <button type="button" className="rail-arrow" aria-label="Previous capabilities" data-off={!edge.prev} tabIndex={edge.prev ? 0 : -1} onClick={() => scrollByPage(-1)}>{I.prev}</button>
            <button type="button" className="rail-arrow" aria-label="Next capabilities" data-off={!edge.next} tabIndex={edge.next ? 0 : -1} onClick={() => scrollByPage(1)}>{I.next}</button>
          </div>
        </div>
      </div>
      <div className="rail-frame" data-prev={edge.prev} data-next={edge.next}>
        <div className="rail" ref={railRef} role="region" aria-label={`${title} cards`} onKeyDown={onKeyDown}>
          <ol className="rail-track">
            {cards.map((c, i) => (
              <RailCard
                key={c.title}
                card={c}
                index={i}
                sectionId={id}
                tagline={tagline}
                isOpen={open === i}
                sheet={sheet}
                panelStyle={open === i && pos && !sheet ? { left: pos.left, top: pos.top, width: pos.width } : undefined}
                handlers={handlersFor(i)}
                sheetRef={sheetRef}
                link={link}
                onClose={close}
                onOpenButton={(e) => {
                  if (open === i) { close(); return; }
                  lastFocus.current = e.currentTarget;
                  openAt(i);
                }}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
