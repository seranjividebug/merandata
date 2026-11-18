import { Link } from "react-router-dom";
import logoWhite from "../assets/logo-white-118.webp";
import { NAV } from "../data";
import { useSectionLink } from "../nav";
import { SocialIcons } from "./SocialIcons";
import ContactDetails from "./ContactDetails";
import { COMPANY } from "../company";

export function Footer() {
  const link = useSectionLink();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <div className="foot-brand"><img src={logoWhite} alt="" width="59" height="40" />Meridanta</div>
            <p>Outcome-driven AI, Data & Cloud solutions, combining technology expertise, business understanding, and engineering execution.</p>
            <SocialIcons />
          </div>
          <div>
            <h2 className="foot-h">Explore</h2>
            <ul>{NAV.map((n) => <li key={n.id}><a {...link(n.id)}>{n.label}</a></li>)}</ul>
          </div>
          <div>
            <h2 className="foot-h">Company</h2>
            <ul>
              <li><a {...link("contact")}>Get in Touch</a></li>
              <li><Link to="/privacy/">Privacy Policy</Link></li>
            </ul>
            <ContactDetails />
          </div>
        </div>
        {/* Legal name, email, phone and address come from src/company.js (empty until confirmed). */}
        <div className="foot-bottom">
          <span>© {__BUILD_YEAR__} {COMPANY.legalName || COMPANY.name}. All rights reserved.</span>
          <span>AI, Data & Analytics, and Cloud Solutions</span>
        </div>
      </div>
    </footer>
  );
}
