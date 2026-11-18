import { SectionHead } from "./Icons";
import ContactCard from "./ContactCard";
import ContactDetails from "./ContactDetails";
import ContactForm from "./ContactForm";
import { CONTACT_FORM_ENABLED } from "../contactConfig";
import locImg from "../assets/loc-qlik.webp";

/**
 * Contact section. With the form switched on (VITE_CONTACT_FORM_ENABLED=true plus a Turnstile site key) it shows the
 * enquiry form; otherwise a contact card with the email address, a "Send us an email" button and the registered office.
 */
export default function Contact() {
  return (
    <section id="contact" className="block alt cv" aria-labelledby="contact-h">
      <div className="wrap">
        <SectionHead id="contact-h" title="Let’s Discuss Your Next Opportunity" intro="Tell us about your business challenge or technology initiative. Our team will review your inquiry and determine how we can help." />
        {CONTACT_FORM_ENABLED && <ContactDetails className="on-light" />}
        <div className="contact">
          {CONTACT_FORM_ENABLED ? <ContactForm /> : <ContactCard />}

          <aside className="loc" aria-label="Qlik Analytics and Integration">
            <img className="loc-img" src={locImg} width="971" height="1188" alt="Qlik Analytics and Integration: end-to-end data integration, analytics, and operational insights with Qlik, shown as a dashboard with data sources, insights found and replication health" loading="lazy" decoding="async" />
          </aside>
        </div>
      </div>
    </section>
  );
}
