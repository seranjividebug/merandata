import { QLIK_OVERVIEW as O } from "../qlikData";
import { useSectionLink } from "../nav";
import { Head } from "vite-react-ssg";
import PageMeta from "../components/PageMeta";
import { seoFor } from "../seo";
import { go } from "../utils";
import { SectionHead } from "../components/Icons";
import { responsiveImage } from "../images";
import Picture from "../components/Picture";
import { Breadcrumb, TrademarkLine } from "../components/QlikBits";
import CapabilityStack from "../components/CapabilityStack";
import CaseStudies from "../components/CaseStudies";
import ServiceJourney from "../components/ServiceJourney";
import AcceleratorsCard from "../components/AcceleratorsCard";
import AnimatedButton from "../components/AnimatedButton";

const PLATFORM_IMG = responsiveImage("qlik-platform", [640, 1024], 1672);
const PLATFORM_SIZES = "(max-width: 900px) calc(100vw - 56px), 600px";

export default function QlikOverview() {
  const link = useSectionLink();
  return (
    <>
      <PageMeta path="/qlik/" />
      <Head><link rel="preload" as="image" type="image/avif" imageSrcSet={PLATFORM_IMG.avif} imageSizes={PLATFORM_SIZES} fetchpriority="high" /></Head>
      <section className="qhero" data-hero aria-labelledby="qlik-h1">
        <div className="wrap">
          <Breadcrumb trail={seoFor("/qlik/").trail} />
          <div className="qhero-in qhero-in--wide">
            <div>
              <div className="qeyebrow">{O.eyebrow}</div>
              <h1 id="qlik-h1">{O.h1}</h1>
              <p className="lede">{O.intro}</p>
              <div className="qhero-ctas">
                <AnimatedButton shine className="hero-btn" {...link("contact")}>Talk to a Qlik Expert</AnimatedButton>
                <AnimatedButton variant="ghost" className="hero-btn" href="#capabilities" onClick={(e) => go("capabilities", e)}>Explore Capabilities</AnimatedButton>
              </div>
            </div>
            <div className="qhero-img"><Picture image={PLATFORM_IMG} sizes={PLATFORM_SIZES} width="1672" height="941" fetchpriority="high" alt="Qlik trusted intelligence layer: agentic architecture, analytics engine and trusted data foundation across platform, analytics and data capabilities, running on AWS, Databricks, Google, Iceberg, Microsoft and Snowflake" decoding="async" /></div>
          </div>
        </div>
        <button type="button" className="qhero-scroll" aria-label="Scroll to Qlik Capabilities" onClick={() => go("capabilities")}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
        </button>
      </section>

      <section id="capabilities" className="block" aria-labelledby="cap-h">
        <div className="wrap">
          <SectionHead id="cap-h" title="Qlik Capabilities" intro="From moving and trusting data to exploring it and acting on it, here is how we help across the Qlik platform." />
          <CapabilityStack />
        </div>
      </section>

      <section id="qlik-services" className="block alt" aria-labelledby="off-h">
        <div className="wrap">
          <SectionHead id="off-h" title="Qlik COE Service Offerings" intro="Our Center of Excellence supports you at every stage, from first proof of concept to day-to-day operations and skills." />
          <ServiceJourney />
        </div>
      </section>

      <section id="accelerators" className="block" aria-labelledby="acc-h">
        <div className="wrap">
          <AcceleratorsCard seeAll />
        </div>
      </section>

      <section className="block alt" aria-labelledby="case-studies-h">
        <div className="wrap"><CaseStudies /></div>
      </section>

      <TrademarkLine />
    </>
  );
}
