import PageMeta from "../components/PageMeta";
import PageHero from "../components/PageHero";
import { Products } from "../components/Products";
import { QlikCta } from "../components/QlikBits";

export default function SolutionsPage() {
  return (
    <>
      <PageMeta path="/solutions/" />
      <PageHero id="sol-h1" path="/solutions/" title="Products & Solutions" intro="Explore Meridanta’s solutions for turning complex data into useful insight and accelerating the delivery of business intelligence." />
      <Products />
      <QlikCta title="Let’s Discuss Your Next Opportunity" text="Tell us about your business challenge or technology initiative. Our team will review your inquiry and determine how we can help." button="Talk to Our Team" />
    </>
  );
}
