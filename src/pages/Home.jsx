import PageMeta from "../components/PageMeta";
import Hero from "../components/Hero";
import { Services } from "../components/Services";
import Industries from "../components/Industries";
import { Products } from "../components/Products";
import About from "../components/About";
import { QlikCta } from "../components/QlikBits";

export default function Home() {
  return (
    <>
      <PageMeta path="/" />
      <Hero />
      <Services />
      <Industries />
      <Products />
      <About />
      <QlikCta title="Let’s Discuss Your Next Opportunity" text="Tell us about your business challenge or technology initiative. Our team will review your inquiry and determine how we can help." button="Talk to Our Team" />
    </>
  );
}
