import { Link } from "react-router-dom";
import { COMPANY, ENQUIRY_EMAIL, addressLine } from "../company";
import AnimatedButton from "./AnimatedButton";

const MAILTO = `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent("Website enquiry")}`;

/** Shown instead of the enquiry form while the form is switched off (see src/contactConfig.js). */
export default function ContactCard() {
  const office = addressLine();
  return (
    <div className="form-card contact-card">
      <h2>
        Email us at <a href={MAILTO}>{ENQUIRY_EMAIL}</a>
      </h2>
      <div>
        <AnimatedButton variant="dark" href={MAILTO}>Send us an email</AnimatedButton>
      </div>
      <p className="contact-privacy">
        We use your details only to respond to your inquiry. See our <Link to="/privacy/">privacy policy</Link>.
      </p>
      {office && (
        <p className="contact-office">
          <strong>{COMPANY.addressLabel + ":"}</strong> {office}
        </p>
      )}
    </div>
  );
}
