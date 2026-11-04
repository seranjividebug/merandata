import { usePageTitle } from "../nav";
import Hero from "../components/Hero";
import { Services } from "../components/Services";
import Industries from "../components/Industries";
import { Products, Cta } from "../components/Products";
import About from "../components/About";
import Contact from "../components/Contact";

const TITLE = "Meridanta | Outcome-driven AI, Data & Cloud Solutions";
const DESCRIPTION = "Meridanta helps organizations solve practical business problems with AI, data and analytics, cloud, and Qlik expertise, delivered with an AI-first, outcome-driven approach.";

export default function Home({ onPrivacy }) {
  usePageTitle(TITLE, DESCRIPTION);
  return (
    <>
      <Hero />
      <Services />
      <Industries />
      <Products />
      <Cta />
      <About />
      <Contact onPrivacy={onPrivacy} />
    </>
  );
}
