import { useCallback, useEffect, useState } from "react";

/**
 * Behaviour shared by the capability rail (CapabilityRail.jsx): which kind of preview to use, the scroll state of the row,
 * and the two preview kinds (a panel attached under the card on desktop, a bottom sheet on touch screens and phones).
 */

/** "hover" (mouse) or "sheet" (touch or phone), and the reduced-motion setting. Starts as hover / false so the prerendered HTML and the first client render agree. */
export function useRailEnvironment() {
  const [mode, setMode] = useState("hover");
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 768px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => { setMode(fine.matches ? "hover" : "sheet"); setReduced(rm.matches); };
    sync();
    fine.addEventListener("change", sync);
    rm.addEventListener("change", sync);
    return () => { fine.removeEventListener("change", sync); rm.removeEventListener("change", sync); };
  }, []);
  return { mode, reduced };
}

/** Whether the row can still scroll left or right (drives the arrow buttons and the edge fades). */
export function useRailEdges(railRef) {
  const [edge, setEdge] = useState({ prev: false, next: true });
  const measure = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const prev = el.scrollLeft > 4;
    const next = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    setEdge((e) => (e.prev === prev && e.next === next ? e : { prev, next }));
  }, [railRef]);
  useEffect(() => {
    const el = railRef.current;
    if (!el) return undefined;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => { el.removeEventListener("scroll", measure); ro?.disconnect(); };
  }, [measure, railRef]);
  return edge;
}

/** While a desktop preview is open: keep it attached to its card when the page or the row scrolls or resizes, and let Esc close it. */
export function useAttachedPreview(open, mode, railRef, place, close) {
  useEffect(() => {
    if (open < 0 || mode !== "hover") return undefined;
    const rail = railRef.current;
    let frame = 0;
    const again = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; place(open); }); };
    const onEsc = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("scroll", again, { passive: true });
    window.addEventListener("resize", again);
    document.addEventListener("keydown", onEsc);
    rail?.addEventListener("scroll", again, { passive: true });
    return () => {
      window.removeEventListener("scroll", again);
      window.removeEventListener("resize", again);
      document.removeEventListener("keydown", onEsc);
      rail?.removeEventListener("scroll", again);
      cancelAnimationFrame(frame);
    };
  }, [open, mode, railRef, place, close]);
}

/** Bottom sheet: locks page scroll, focuses the close button, Esc closes, Tab stays inside, focus goes back to the card button on close. */
export function useBottomSheet(open, mode, sheetRef, lastFocus, close) {
  useEffect(() => {
    if (open < 0 || mode !== "sheet") return undefined;
    const sheet = sheetRef.current;
    const root = document.documentElement;
    root.style.overflow = "hidden";
    root.classList.add("rail-sheet-open");
    sheet?.querySelector(".rail-x")?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { close(); return; }
      if (e.key !== "Tab" || !sheet) return;
      const f = [...sheet.querySelectorAll("button, a[href]")].filter((n) => n.tabIndex >= 0);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      root.style.removeProperty("overflow");
      root.classList.remove("rail-sheet-open");
      document.removeEventListener("keydown", onKey);
      lastFocus.current?.focus?.();
    };
  }, [open, mode, sheetRef, lastFocus, close]);
}
