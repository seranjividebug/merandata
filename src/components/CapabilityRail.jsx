import { useCallback, useEffect, useRef, useState } from "react";
import { I } from "./Icons";
import { useSectionLink } from "../nav";
import RailArt from "./railArt";
import "../rail.css";

const INTENT_MS = 250; // hover intent delay

/** Where to put the preview panel and which way the poster grows: left edge, right edge or from the middle. */
function placement(wrap) {
  const r = wrap.getBoundingClientRect();
  const left = Math.max(8, Math.min(r.left, window.innerWidth - 8 - r.width));
  return { left, top: r.bottom, width: r.width };
}

/**
 * Rail of illustrated cards for a service page's capabilities. Every title, description and bullet is in the page HTML
 * (the preview panels are visually hidden until opened). Desktop: hover or focus opens a preview under the poster
 * (position:fixed, so the scrolling rail never clips it and nothing shifts). Phones and touch: tapping a poster opens
 * the same preview as a bottom sheet.
 */
export default function CapabilityRail({ section, tagline }) {
  const { id, title, cards } = section;
  const link = useSectionLink();
  const railRef = useRef(null);
  const timer = useRef(0);
  const sheetRef = useRef(null);
  const lastFocus = useRef(null);
  const skipFocus = useRef(false); // set while focus is moved back to a poster after Esc, so it does not reopen
  const [open, setOpen] = useState(-1);
  const [mode, setMode] = useState("hover"); // "hover" (mouse) or "sheet" (touch / phone)
  const [pos, setPos] = useState(null);
  const [edge, setEdge] = useState({ prev: false, next: true });
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setMode(fine.matches ? "hover" : "sheet"); setReduced(rm.matches); };
    sync();
    fine.addEventListener("change", sync); rm.addEventListener("change", sync);
    return () => { fine.removeEventListener("change", sync); rm.removeEventListener("change", sync); };
  }, []);

  const measureEdges = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const prev = el.scrollLeft > 4, next = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setEdge((e) => (e.prev === prev && e.next === next ? e : { prev, next }));
  }, []);
  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    measureEdges();
    el.addEventListener("scroll", measureEdges, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measureEdges) : null;
    ro?.observe(el);
    return () => { el.removeEventListener("scroll", measureEdges); ro?.disconnect(); };
  }, [measureEdges]);

  const place = useCallback((i) => {
    const wrap = railRef.current?.querySelectorAll(".rail-pw")[i];
    if (wrap) setPos(placement(wrap));
  }, []);

  const openAt = useCallback((i) => { place(i); setOpen(i); }, [place]);
  const close = useCallback(() => { window.clearTimeout(timer.current); setOpen(-1); }, []);

  // While a desktop preview is open, keep it attached to its poster when the page or the rail scrolls or resizes.
  useEffect(() => {
    if (open < 0 || mode !== "hover") return undefined;
    let frame = 0;
    const again = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; place(open); }); };
    window.addEventListener("scroll", again, { passive: true });
    window.addEventListener("resize", again);
    const onEsc = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onEsc);
    railRef.current?.addEventListener("scroll", again, { passive: true });
    const rail = railRef.current;
    return () => { document.removeEventListener("keydown", onEsc); window.removeEventListener("scroll", again); window.removeEventListener("resize", again); rail?.removeEventListener("scroll", again); cancelAnimationFrame(frame); };
  }, [open, mode, place, close]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Bottom sheet: lock page scroll, focus the close button, Esc closes, Tab stays inside, focus returns on close.
  useEffect(() => {
    if (open < 0 || mode !== "sheet") return undefined;
    const sheet = sheetRef.current;
    document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("rail-sheet-open");
    sheet?.querySelector(".rail-x")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab" || !sheet) return;
      const f = [...sheet.querySelectorAll("button, a[href]")].filter((n) => n.tabIndex >= 0);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.removeProperty("overflow");
      document.documentElement.classList.remove("rail-sheet-open");
      document.removeEventListener("keydown", onKey);
      lastFocus.current?.focus?.();
    };
  }, [open, mode, close]);

  const scrollByPage = (dir) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduced ? "auto" : "smooth" });
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape" && mode === "hover" && open >= 0) { const n = open; close(); skipFocus.current = true; railRef.current?.querySelectorAll(".rail-go")[n]?.focus(); skipFocus.current = false; return; }
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const posters = [...railRef.current.querySelectorAll(".rail-go")];
    const at = posters.indexOf(document.activeElement);
    if (at < 0) return;
    e.preventDefault();
    posters[Math.max(0, Math.min(posters.length - 1, at + (e.key === "ArrowRight" ? 1 : -1)))].focus();
  };

  // Swipe down on the sheet to close it.
  const drag = useRef(0);
  const sheetTouch = {
    onTouchStart: (e) => { drag.current = e.touches[0].clientY; },
    onTouchEnd: (e) => { if (e.changedTouches[0].clientY - drag.current > 70) close(); },
  };

  const sheet = mode === "sheet";
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
        <div className="rail" ref={railRef} role="region" aria-label="Key capabilities" onKeyDown={onKeyDown}>
          <ol className="rail-track">
            {cards.map((c, i) => {
              const isOpen = open === i;
              const pid = `${id}-pv-${i}`;
              const style = isOpen && pos && !sheet ? { left: pos.left, top: pos.top, width: pos.width } : undefined;
              return (
                <li
                  key={c.title}
                  className={"rail-item" + (isOpen ? " is-open" : "")}
                  onPointerEnter={(e) => {
                    if (mode !== "hover" || e.pointerType !== "mouse") return;
                    window.clearTimeout(timer.current);
                    timer.current = window.setTimeout(() => openAt(i), reduced ? 0 : INTENT_MS);
                  }}
                  onPointerLeave={(e) => { if (mode === "hover" && e.pointerType === "mouse") close(); }}
                  onFocus={(e) => { if (mode === "hover" && !skipFocus.current && e.target.matches(":focus-visible") && e.target.classList.contains("rail-go")) openAt(i); }}
                  onBlur={(e) => { if (mode === "hover" && !e.currentTarget.contains(e.relatedTarget)) close(); }}
                >
                  <div className="rail-pw">
                    <div className="rail-poster">
                      <div className="rail-media">
                        <RailArt id={`${id}-${i}`} i={i} art={c.art} />
                        <span className="rail-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="rail-body">
                        <div className="rail-txt">
                          <h3 className="rail-name">{c.title}</h3>
                          {c.desc && <p className="rail-text">{c.desc}</p>}
                        </div>
                        <button
                          type="button"
                          className="rail-go"
                          aria-label={`More about ${c.title}`}
                          aria-expanded={isOpen}
                          aria-controls={pid}
                          onClick={(e) => {
                            if (isOpen) { close(); return; }
                            lastFocus.current = e.currentTarget;
                            openAt(i);
                          }}
                        >
                          {I.next}
                        </button>
                      </div>
                    </div>
                  </div>
                  {sheet && isOpen && <div className="rail-backdrop" onClick={close} aria-hidden="true" />}
                  <div
                    id={pid}
                    ref={isOpen && sheet ? sheetRef : null}
                    className={"rail-pv" + (isOpen ? (sheet ? " is-sheet" : " is-panel") : "")}
                    role={isOpen && sheet ? "dialog" : "group"}
                    aria-modal={isOpen && sheet ? "true" : undefined}
                    aria-label={c.title}
                    style={style}
                    {...(isOpen && sheet ? sheetTouch : {})}
                  >
                    {isOpen && sheet && (
                      <div className="rail-sheet-bar">
                        <span className="rail-grip" aria-hidden="true" />
                        <button type="button" className="rail-x" aria-label="Close preview" onClick={close}>{I.close}</button>
                      </div>
                    )}
                    <div className="rail-pv-title">{c.title}</div>
                    {!c.desc && <p className="rail-desc">{tagline}</p>}
                    {c.bullets?.length > 0 && <ul>{c.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
                    <a className="rail-chip" tabIndex={isOpen ? 0 : -1} {...link("contact")}>Discuss <span aria-hidden="true">→</span></a>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
