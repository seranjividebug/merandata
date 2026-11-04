import { QLIK_ACCELERATORS, QLIK_BENEFITS } from "../data";
import { QLIK_OFFERINGS, QLIK_OVERVIEW as O } from "../qlikData";
import { usePageTitle, useSectionLink } from "../nav";
import { go } from "../utils";
import { I, SectionHead } from "../components/Icons";
import platformImg from "../assets/qlik-platform.webp";
import { Breadcrumb, QlikCta, TrademarkLine } from "../components/QlikBits";
import CapabilityStack from "../components/CapabilityStack";

export default function QlikOverview() {
  usePageTitle(O.title, O.description);
  const link = useSectionLink();
  return (
    <>
      <section className="qhero" aria-labelledby="qlik-h1">
        <div className="wrap">
          <Breadcrumb trail={[{ label: "Qlik" }]} />
          <div className="qhero-in qhero-in--wide">
            <div>
              <div className="qeyebrow">{O.eyebrow}</div>
              <h1 id="qlik-h1">{O.h1}</h1>
              <p className="lede">{O.intro}</p>
              <div className="qhero-ctas">
                <a className="btn btn-grad" {...link("contact")}>Talk to a Qlik Expert</a>
                <a className="btn btn-ghost-light" href="#capabilities" onClick={(e) => go("capabilities", e)}>Explore Capabilities</a>
              </div>
            </div>
            <div className="qhero-img"><img src={platformImg} width="1672" height="941" alt="Qlik trusted intelligence layer: agentic architecture, analytics engine and trusted data foundation across platform, analytics and data capabilities, running on AWS, Databricks, Google, Iceberg, Microsoft and Snowflake" decoding="async" /></div>
          </div>
        </div>
      </section>

      <section id="capabilities" className="block" aria-labelledby="cap-h">
        <div className="wrap">
          <SectionHead id="cap-h" title="Qlik Capabilities" intro="From moving and trusting data to exploring it and acting on it, here is how we help across the Qlik platform." />
          <CapabilityStack />
        </div>
      </section>

      <section className="block alt" aria-labelledby="off-h">
        <div className="wrap">
          <SectionHead id="off-h" title="Qlik COE Service Offerings" intro="Our Center of Excellence supports you at every stage, from first proof of concept to day-to-day operations and skills." />
          <div className="services two">
            {QLIK_OFFERINGS.map((o) => (
              <article key={o.title} className="svc">
                <div className="icon">{I[o.icon]}</div>
                <h3>{o.title}</h3>
                <ul>{o.items.map((t) => <li key={t}>{t}</li>)}</ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="block" aria-labelledby="acc-h">
        <div className="wrap">
          <article className="prod feature">
            <span className="badge"><i />Home-grown solution</span>
            <h3 id="acc-h">Qlik Accelerators</h3>
            <p className="lead">Reusable, Meridanta-built components that speed up Qlik development, standardize implementation patterns, and improve consistency across analytics delivery.</p>
            <div className="chips" aria-label="Available accelerators">{QLIK_ACCELERATORS.map((t) => <span key={t} className="chip">{t}</span>)}</div>
            <ul className="feat-list">
              {QLIK_BENEFITS.map(([t, d]) => <li key={t}>{I.check}<span><strong>{t}</strong>{d}</span></li>)}
            </ul>
            <a className="qlink" {...link("solutions")}>See all products and solutions {I.go}</a>
          </article>
        </div>
      </section>

      <QlikCta />
      <TrademarkLine />
    </>
  );
}
