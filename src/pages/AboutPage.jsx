import PageMeta from "../components/PageMeta";
import PageHero from "../components/PageHero";
import About from "../components/About";
import { QlikCta } from "../components/QlikBits";

export default function AboutPage() {
  return (
    <>
      <PageMeta path="/about/" />
      <PageHero id="about-h1" path="/about/" title="About Meridanta" intro="AI, Data & Analytics, and Cloud solutions for organizations in the United States and India." />
      <About />
      <QlikCta title="Let’s Discuss Your Next Opportunity" text="Tell us about your business challenge or technology initiative. Our team will review your inquiry and determine how we can help." button="Talk to Our Team" />
    </>
  );
}
