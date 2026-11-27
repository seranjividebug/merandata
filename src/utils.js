import { useEffect, useLayoutEffect, useState } from "react";

// Read in event handlers and effects only. Render output must use useReducedMotion() so the
// server-rendered HTML and the first client render match.
export const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let auto = false; // true while a scroll started by scrollToEl is running
let current = 0; // the latest scrollToEl call; an older one stops quietly when a newer one starts
/** True while the page is scrolling because a link asked for it (the header highlight and the floating button wait for it). */
export const isAutoScrolling = () => auto;
const announce = (type, id) => window.dispatchEvent(new CustomEvent(type, { detail: { id } }));

/**
 * Scrolls an element to the top of the screen, below the header (html has scroll-padding-top for that). The sections
 * have a fixed height before they are reached (nothing renders lazily), so this is one smooth scroll. When it has
 * stopped, the position is checked once, after the fonts are ready, and corrected without animation if it is more than
 * 2px off. A visitor who scrolls by hand takes over at once. "mdn:scroll-start" and "mdn:scroll-end" (detail.id is the
 * element id) are sent on window so other parts of the page can stay still while it runs.
 */
export function scrollToEl(el) {
  const mine = ++current;
  const id = el.id || "";
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const events = ["wheel", "touchstart", "keydown"];
  let done = false;
  const release = () => events.forEach((t) => window.removeEventListener(t, onUser));
  const finish = (correct) => {
    if (done) return;
    done = true;
    release();
    if (mine !== current) return; // a newer scroll took over
    const end = () => { if (mine !== current) return; auto = false; announce("mdn:scroll-end", id); };
    if (!correct || !el.isConnected) { end(); return; }
    const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    ready.then(() => {
      if (mine === current && el.isConnected && Math.abs(el.getBoundingClientRect().top - pad) > 2) el.scrollIntoView({ behavior: "auto", block: "start" });
    }).then(end, end);
  };
  const onUser = () => finish(false);
  events.forEach((t) => window.addEventListener(t, onUser, { once: true, passive: true }));
  auto = true;
  announce("mdn:scroll-start", id);
  el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
  let last = -1;
  let still = 0;
  let n = 0;
  const tick = () => {
    if (done) return;
    if (mine !== current) { done = true; release(); return; }
    const y = Math.round(window.scrollY);
    still = y === last ? still + 1 : 0;
    last = y;
    if (still >= 3 || ++n > 60) finish(true);
    else window.setTimeout(tick, 90);
  };
  window.setTimeout(tick, REDUCED ? 60 : 150);
}

/** Smooth-scroll to a section and move keyboard focus to its heading. */
export function go(id, e) {
  if (e) e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  scrollToEl(el);
  const heading = el.querySelector("h1, h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    setTimeout(() => heading.focus({ preventScroll: true }), REDUCED ? 0 : 500);
  }
}

/** useLayoutEffect in the browser; a plain effect on the server (where layout effects only warn). */
export const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** True while the media query matches. Starts false so prerendered HTML and hydration agree, then updates in an effect. */
export function useMedia(query) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}

/** Reduced-motion preference, safe to use while rendering. */
export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
