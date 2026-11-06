import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSectionLink } from "../nav";
import { REDUCED } from "../utils";
import AnimatedButton from "./AnimatedButton";

const SHOW_TOP_AFTER = 400;

/** Global bottom-right buttons: "Talk to an Expert" ("Talk to a Qlik Expert" on /qlik) and, once scrolled, "Back to top". Rendered once in App. */
export default function FloatingActions() {
  const link = useSectionLink();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [atContact, setAtContact] = useState(false);
  const [atHero, setAtHero] = useState(false);
  const [atCases, setAtCases] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SHOW_TOP_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The contact form is what the button points to, so hide it while that section is on screen.
  useEffect(() => {
    setAtContact(false);
    const el = document.getElementById("contact");
    if (!el) return undefined;
    const io = new IntersectionObserver(([en]) => setAtContact(en.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);

  // The hero already has its own buttons: keep the floating one out of the way until it scrolls past.
  useEffect(() => {
    setAtHero(false);
    const el = document.querySelector("[data-hero]");
    if (!el) return undefined;
    const io = new IntersectionObserver(([en]) => setAtHero(en.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);
  // Keep the button off the Proven Outcomes panel while that section is on screen.
  useEffect(() => {
    setAtCases(false);
    const el = document.getElementById("case-studies");
    if (!el) return undefined;
    const io = new IntersectionObserver(([en]) => setAtCases(en.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [pathname]);
  const hidden = atContact || atHero || atCases;
  const label = /^\/qlik(\/|$)/.test(pathname) ? "Talk to a Qlik Expert" : "Talk to an Expert";

  const toTop = (e) => {
    window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
    e.currentTarget.blur();
  };

  return (
    <div className="fab">
      <button type="button" className={"fab-top" + (scrolled ? " is-on" : "")} aria-label="Back to top" tabIndex={scrolled ? 0 : -1} aria-hidden={scrolled ? undefined : "true"} onClick={toTop}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
      <AnimatedButton variant="dark" className={"fab-talk" + (hidden ? " is-off" : "")} {...link("contact")} tabIndex={hidden ? -1 : 0} aria-label={label}>{label}</AnimatedButton>
    </div>
  );
}
