import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo-112.webp";
import { BRAND_TAGLINE, HEADER_NAV } from "../data";
import { SERVICE_MENU } from "../services";
import { useSectionLink } from "../nav";
import { I } from "./Icons";
import Search from "./Search";
import AnimatedButton from "./AnimatedButton";

const Chevron = () => (
  <svg className="nav-chev" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 4.5 6 8l3.5-3.5" /></svg>
);

/**
 * The "Services" item: a disclosure button that opens a list of links. It opens on hover and on click or Enter/Space,
 * closes on Escape (focus returns to the button), on a click elsewhere and when focus leaves. The links are always in
 * the HTML (hidden with a CSS class while closed), so crawlers see them.
 * `mobile` renders the same list as an expandable group inside the mobile menu.
 */
function ServicesMenu({ label, mobile = false, onNavigate }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const button = useRef(null);
  const closeTimer = useRef(null);
  const byHover = useRef(false); // opened by the pointer resting on the button (a click then keeps it open instead of closing it)
  const id = mobile ? "svc-menu-m" : "svc-menu";

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") { byHover.current = false; setOpen(false); button.current?.focus(); } };
    const onDown = (e) => { if (root.current && !root.current.contains(e.target)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open]);
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const hover = !mobile && {
    onMouseEnter: () => { clearTimeout(closeTimer.current); if (!open) { byHover.current = true; setOpen(true); } },
    onMouseLeave: () => { if (byHover.current) closeTimer.current = setTimeout(() => { byHover.current = false; setOpen(false); }, 150); },
  };
  const onBlur = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); };
  const toggle = () => {
    if (open && byHover.current) { byHover.current = false; return; } // a click on a hover-opened menu keeps it open
    byHover.current = false;
    setOpen(!open);
  };
  const go = () => { byHover.current = false; setOpen(false); if (onNavigate) onNavigate(); };

  return (
    <div ref={root} className={"nav-dd" + (mobile ? " is-mobile" : "") + (open ? " is-open" : "")} onBlur={onBlur} {...hover}>
      <button ref={button} type="button" className="nav-dd-btn" aria-expanded={open} aria-controls={id} onClick={toggle}>
        {label}<Chevron />
      </button>
      <ul id={id} className="nav-dd-list">
        {SERVICE_MENU.map((s) => (
          <li key={s.label}><Link to={s.to} onClick={go}>{s.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export default function Header({ active }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const link = useSectionLink();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const esc = (e) => { if (e.key === "Escape") { setOpen(false); document.querySelector(".menu-btn")?.focus(); } };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const close = () => setOpen(false);
  const links = (mobile) => HEADER_NAV.map((n) => (n.id === "services"
    ? <ServicesMenu key={n.id} label={n.label} mobile={mobile} onNavigate={close} />
    : <a key={n.id} {...link(n.id, close)} aria-current={active === n.id ? "true" : undefined}>{n.label}</a>));
  const talk = <>Let’s Talk<span className="sr"> – get in touch</span></>;

  return (
    <header className={"header" + (scrolled ? " scrolled" : "")}>
      <div className="header-in">
        <div className="brand-block">
          <a className="brand" {...link("home", close)} aria-label="Meridanta home">
            <img src={logo} alt="" width="56" height="38" />
            <span className="brand-name">Meridanta</span>
          </a>
          <span className="brand-tag">{BRAND_TAGLINE}</span>
        </div>
        <nav className="nav" aria-label="Main">{links(false)}</nav>
        <Search onOpen={close} />
        <AnimatedButton variant="dark" className="cta-head" {...link("contact", close)}>{talk}</AnimatedButton>
        <button className="menu-btn" aria-expanded={open} aria-controls="mnav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? I.close : I.menu}
        </button>
      </div>
      <nav id="mnav" className={"mobile-nav" + (open ? " open" : "")} aria-label="Mobile">
        {links(true)}
        <a className="btn btn-dark" {...link("contact", close)}>{talk}</a>
      </nav>
    </header>
  );
}
