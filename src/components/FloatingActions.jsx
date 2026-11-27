import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSectionLink } from "../nav";
import { REDUCED, isAutoScrolling } from "../utils";
import AnimatedButton from "./AnimatedButton";

const SHOW_TOP_AFTER = 400;

/** Global bottom-right buttons: "Talk to an Expert" ("Talk to a Qlik Expert" on /qlik) and, once scrolled, "Back to top". Rendered once in App. */
export default function FloatingActions() {
  const link = useSectionLink();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [atContact, setAtContact] = useState(false);
  const [atOther, setAtOther] = useState(false);

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

  // Keep the button out of the way while the hero (it has its own buttons), the Proven Outcomes panel or a card section
  // (Qlik Capabilities, home Solutions) is on screen.
  useEffect(() => {
    setAtOther(false);
    const els = [document.querySelector("[data-hero]"), ...["case-studies", "capabilities", "solutions"].map((id) => document.getElementById(id))].filter(Boolean);
    if (!els.length) return undefined;
    const on = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => (en.isIntersecting ? on.add(en.target) : on.delete(en.target)));
      setAtOther(on.size > 0);
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  const wanted = atContact || atOther;
  // The "Talk to an Expert" button keeps its state while a link scrolls the page, then follows the sections after a short
  // pause, so it never flickers. (Right after the page loads it follows at once.)
  const [hidden, setHidden] = useState(false);
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    const on = () => setAuto(true);
    const off = () => setAuto(false);
    setAuto(isAutoScrolling());
    window.addEventListener("mdn:scroll-start", on);
    window.addEventListener("mdn:scroll-end", off);
    return () => { window.removeEventListener("mdn:scroll-start", on); window.removeEventListener("mdn:scroll-end", off); };
  }, []);
  useEffect(() => {
    if (auto) return undefined;
    const settling = typeof performance !== "undefined" && performance.now() < 1500;
    const t = window.setTimeout(() => setHidden(wanted), settling ? 0 : 200);
    return () => window.clearTimeout(t);
  }, [wanted, auto]);
  const label = /^\/qlik(\/|$)/.test(pathname) ? "Talk to a Qlik Expert" : "Talk to an Expert";

  const toTop = (e) => {
    window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
    const main = document.getElementById("main");
    if (main) { main.setAttribute("tabindex", "-1"); main.focus({ preventScroll: true }); } else e.currentTarget.blur();
  };

  return (
    <aside className="fab" aria-label="Quick actions">
      <button type="button" className={"fab-top" + (scrolled ? " is-on" : "")} aria-label="Back to top" tabIndex={scrolled ? 0 : -1} aria-hidden={scrolled ? undefined : "true"} onClick={toTop}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
      <AnimatedButton variant="dark" className={"fab-talk" + (hidden ? " is-off" : "")} {...link("contact")} tabIndex={hidden ? -1 : 0} aria-label={label}>{label}</AnimatedButton>
    </aside>
  );
}
