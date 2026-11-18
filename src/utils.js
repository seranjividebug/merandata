import { useEffect, useLayoutEffect, useState } from "react";

// Read in event handlers and effects only. Render output must use useReducedMotion() so the
// server-rendered HTML and the first client render match.
export const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Scrolls an element to the top of the screen (below the header). Long sections that skip rendering until they are
 * near the screen change size while the page scrolls past them, so the position is checked once more at the end and
 * corrected if the element did not land where it should.
 */
export function scrollToEl(el) {
  el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  window.setTimeout(() => {
    if (Math.abs(el.getBoundingClientRect().top - pad) > 8) el.scrollIntoView({ behavior: "auto", block: "start" });
  }, REDUCED ? 100 : 1100);
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
