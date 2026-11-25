import PageMeta from "../components/PageMeta";
import Hero from "../components/Hero";
import { Services } from "../components/Services";
import { AboutTeaser, IndustriesTeaser, SolutionsTeaser } from "../components/HomeTeasers";
import { QlikCta } from "../components/QlikBits";

/** Home: hero, What We Do, short teasers for the Industries, Products & Solutions and About pages, and a contact band. */
export default function Home() {
  return (
    <>
      <PageMeta path="/" />
      <Hero />
      <Services />
      <IndustriesTeaser />
      <SolutionsTeaser />
      <AboutTeaser />
      <QlikCta title="Let’s Discuss Your Next Opportunity" text="Tell us about your business challenge or technology initiative. Our team will review your inquiry and determine how we can help." button="Talk to Our Team" compact />
    </>
  );
}
