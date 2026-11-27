import PageMeta from "../components/PageMeta";
import { Breadcrumb } from "../components/QlikBits";
import ContactCard from "../components/ContactCard";
import ContactDetails from "../components/ContactDetails";
import ContactForm from "../components/ContactForm";
import { CONTACT_FORM_ENABLED } from "../contactConfig";
import { seoFor } from "../seo";
import locImg from "../assets/loc-qlik.webp";

/**
 * /contact/: the contact page. With the form switched on (VITE_CONTACT_FORM_ENABLED=true plus a Turnstile site key)
 * it shows the enquiry form; otherwise a contact card with the email address, a "Send us an email" button and the
 * registered office. Links from the rest of the site may add ?interest=<key> to preselect the service (see src/data.js).
 */
export default function ContactPage() {
  return (
    <>
      <PageMeta path="/contact/" />
      <section id="contact" className="block alt" aria-labelledby="contact-h">
        <div className="wrap">
          <Breadcrumb trail={seoFor("/contact/").trail} light />
          <div className="head">
            <div className="rule" />
            <h1 id="contact-h">Let’s Discuss Your Next Opportunity</h1>
            <p>Tell us about your business challenge or technology initiative. Our team will review your inquiry and determine how we can help.</p>
          </div>
          {CONTACT_FORM_ENABLED && <ContactDetails className="on-light" />}
          <div className="contact">
            {CONTACT_FORM_ENABLED ? <ContactForm /> : <ContactCard />}

            <div className="loc">
              <img className="loc-img" src={locImg} width="971" height="1188" alt="Qlik Analytics and Integration: end-to-end data integration, analytics, and operational insights with Qlik, shown as a dashboard with data sources, insights found and replication health" loading="lazy" decoding="async" />
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
