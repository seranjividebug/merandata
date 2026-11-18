import PageMeta from "../components/PageMeta";
import Hero from "../components/Hero";
import { Services } from "../components/Services";
import Industries from "../components/Industries";
import { Products } from "../components/Products";
import About from "../components/About";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <>
      <PageMeta path="/" />
      <Hero />
      <Services />
      <Industries />
      <Products />
      <About />
      <Contact />
    </>
  );
}
