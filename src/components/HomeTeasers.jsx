import { Link } from "react-router-dom";
import { INDUSTRIES } from "../data";
import { ABOUT, COMPANY } from "../company";
import { ABOUT_HIGHLIGHTS } from "../aboutData";
import { I } from "./Icons";
import "../teasers.css";

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

/** One small card; the whole card is the link (the title link is stretched over it). */
function TeaserCard({ icon, title, line, to, cta }) {
  return (
    <article className="tz-card">
      <div className="tz-card-top">
        <span className="tz-ic" aria-hidden="true">{I[icon]}</span>
        <h3>{title}</h3>
      </div>
      <p>{line}</p>
      <Link className="tz-more" to={to}>{cta}<Arrow /></Link>
    </article>
  );
}

const SeeAll = ({ to, children }) => (
  <Link className="btn btn-outline tz-all" to={to}>{children}<Arrow /></Link>
);

/** Heading (rule, h2, one line) with the "Explore ..." button on the right. */
function TeaserHead({ id, title, intro, to, cta, big }) {
  return (
    <div className="tz-head">
      <div className="head">
        <div className="rule" />
        <h2 id={id} className={big ? "tz-big" : undefined}>{title}</h2>
        {intro && <p>{intro}</p>}
      </div>
      <SeeAll to={to}>{cta}</SeeAll>
    </div>
  );
}

export function IndustriesTeaser() {
  return (
    <section className="block tz alt" aria-labelledby="tz-ind-h">
      <div className="wrap">
        <TeaserHead id="tz-ind-h" title="Industries We Serve" intro="Complex, data-driven industries where AI, data and analytics make a measurable difference." to="/industries/" cta="Explore Industries" />
        <div className="tz-grid tz-2">
          {INDUSTRIES.map((d) => (
            <TeaserCard key={d.key} icon={d.key === "health" ? "health" : "chart"} title={d.tab} line={d.miniDesc} to={"/industries/" + d.slug + "/"} cta="Learn more" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function SolutionsTeaser() {
  return (
    <section className="block tz" aria-labelledby="tz-sol-h">
      <div className="wrap">
        <TeaserHead id="tz-sol-h" title="Products & Solutions" intro="Solutions for turning complex data into useful insight, faster." to="/solutions/" cta="Explore Solutions" />
        <div className="tz-grid tz-3">
          <TeaserCard icon="spark" title="Qlik Accelerators" line="Ready-made components that speed up Qlik monitoring, reporting and operations." to="/qlik/#accelerators" cta="Explore accelerators" />
          <TeaserCard icon="health" title="HCInsights" line="A turnkey healthcare insights solution that unifies clinical, operational and financial data." to="/industries/healthcare/" cta="Explore HCInsights" />
          <TeaserCard icon="db" title="Data Platforms & Cloud Solutions" line="Implementation capabilities to build, modernize, and operate data and analytics environments." to="/solutions/#platforms" cta="See platforms" />
        </div>
      </div>
    </section>
  );
}

export function AboutTeaser() {
  const [lead, accent] = COMPANY.slogan.split(". ");
  return (
    <section className="block tz alt" aria-labelledby="tz-about-h">
      <div className="wrap">
        <div className="tz-about">
          <div className="head">
            <div className="rule" />
            <h2 id="tz-about-h" className="tz-big">{lead}. <span>{accent}</span></h2>
            <SeeAll to="/about/">About Meridanta</SeeAll>
          </div>
          <div className="tz-about-copy">{ABOUT.map((t) => <p key={t}>{t}</p>)}</div>
        </div>
        <ul className="tz-chips">
          {ABOUT_HIGHLIGHTS.map(([ic, t]) => <li key={t}><span aria-hidden="true">{I[ic]}</span>{t}</li>)}
        </ul>
      </div>
    </section>
  );
}
