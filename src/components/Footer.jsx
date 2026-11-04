import { useEffect, useRef } from "react";
import logoWhite from "../assets/logo-white.png";
import { NAV } from "../data";
import { useSectionLink } from "../nav";

export function Footer({ onPrivacy }) {
  const link = useSectionLink();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-brand"><img src={logoWhite} alt="" width="59" height="40" />Meridanta</div>
            <p>Outcome-driven AI, Data & Cloud solutions, combining technology expertise, business understanding, and engineering execution.</p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>{NAV.map((n) => <li key={n.id}><a {...link(n.id)}>{n.label}</a></li>)}</ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a {...link("contact")}>Get in Touch</a></li>
              <li><button className="linkbtn" style={{ textDecoration: "none" }} onClick={onPrivacy}>Privacy Policy</button></li>
            </ul>
          </div>
        </div>
        {/* TODO: confirm registered legal entity name and business email before launch */}
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} Meridanta. All rights reserved.</span>
          <span>AI, Data & Analytics, and Cloud Solutions</span>
        </div>
      </div>
    </footer>
  );
}

export function PrivacyDialog({ onClose }) {
  const btn = useRef();
  useEffect(() => {
    const prev = document.activeElement;
    btn.current?.focus();
    const esc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("keydown", esc); prev?.focus?.(); };
  }, [onClose]);
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="pp-h">
        <h2 id="pp-h">Privacy policy</h2>
        <p>Meridanta collects only the contact details needed to respond to your inquiry: your name, business email, optional company, and message. We do not sell or share this information.</p>
        <p>The full privacy policy will be published here before the contact form goes live.</p>
        <button ref={btn} className="btn btn-dark" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
