import PageMeta from "../components/PageMeta";
import PageHero from "../components/PageHero";
import Industries from "../components/Industries";
import { QlikCta } from "../components/QlikBits";

export default function IndustriesPage() {
  return (
    <>
      <PageMeta path="/industries/" />
      <PageHero id="ind-h1" path="/industries/" title="Industries We Serve" intro="We apply AI, data, analytics, and modern technology capabilities to the needs of complex, data-driven industries." />
      <Industries />
      <QlikCta title="Let’s Discuss Your Next Opportunity" text="Tell us about your business challenge or technology initiative. Our team will review your inquiry and determine how we can help." button="Talk to Our Team" />
    </>
  );
}
