import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { NAV } from "../data";
import { useSectionLink } from "../nav";
import { I } from "./Icons";
import Search from "./Search";

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
    if (!open) return;
    const esc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  const close = () => setOpen(false);
  const links = NAV.map((n) => (
    <a key={n.id} {...link(n.id, close)} aria-current={active === n.id ? "true" : undefined}>{n.label}</a>
  ));

  return (
    <header className={"header" + (scrolled ? " scrolled" : "")}>
      <div className="wrap header-in">
        <a className="brand" {...link("home", close)} aria-label="Meridanta home">
          <img src={logo} alt="" width="56" height="38" />
          <span className="brand-name">Meridanta</span>
        </a>
        <nav className="nav" aria-label="Main">{links}</nav>
        <Search onOpen={close} />
        <a className="btn btn-dark cta-head" {...link("contact", close)}>Get in Touch</a>
        <button className="menu-btn" aria-expanded={open} aria-controls="mnav" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? I.close : I.menu}
        </button>
      </div>
      <nav id="mnav" className={"mobile-nav" + (open ? " open" : "")} aria-label="Mobile">
        {links}
        <a className="btn btn-dark" {...link("contact", close)}>Get in Touch</a>
      </nav>
    </header>
  );
}
