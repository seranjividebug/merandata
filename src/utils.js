import { useEffect, useLayoutEffect, useState } from "react";

// Read in event handlers and effects only. Render output must use useReducedMotion() so the
// server-rendered HTML and the first client render match.
export const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smooth-scroll to a section and move keyboard focus to its heading. */
export function go(id, e) {
  if (e) e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
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
