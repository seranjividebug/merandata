import { HC_FEATURES, PLATFORM, QLIK_BENEFITS, TALEND } from "../data";
import { go } from "../utils";
import { I, SectionHead } from "./Icons";
import AcceleratorChips from "./Accelerators";

const FeatList = ({ items }) => (
  <ul className="feat-list">
    {items.map(([t, d]) => (
      <li key={t}>{I.check}<span><strong>{t}</strong>{d}</span></li>
    ))}
  </ul>
);
const Chips = ({ items, label }) => (
  <div className="chips" aria-label={label}>{items.map((t) => <span key={t} className="chip">{t}</span>)}</div>
);

export function Products() {
  return (
    <section id="solutions" className="block alt" aria-labelledby="prod-h">
      <div className="wrap">
        <SectionHead id="prod-h" title="Products & Solutions" intro="Explore Meridanta’s solutions for turning complex data into useful insight and accelerating the delivery of business intelligence." />
        <div className="prods">
          <article className="prod feature">
            <span className="badge"><i />Home-grown solution</span>
            <h3>HCInsights</h3>
            <p className="lead">A turnkey healthcare insights solution that brings fragmented clinical, operational, and financial data together for data-informed decisions.</p>
            <FeatList items={HC_FEATURES} />
          </article>
          <article className="prod feature">
            <span className="badge"><i />Home-grown solution</span>
            <h3>Qlik Accelerators</h3>
            <p className="lead">Reusable, Meridanta-built components that speed up Qlik development, standardize implementation patterns, and improve consistency across analytics delivery.</p>
            <AcceleratorChips />
            <FeatList items={QLIK_BENEFITS} />
          </article>
          <article className="prod wide">
            <div>
              <span className="badge"><i />Platforms & implementation</span>
              <h3>Data Platforms & Cloud Solutions</h3>
              <p className="lead">Technology solutions and implementation capabilities that help organizations build, modernize, and operate data and analytics environments.</p>
            </div>
            <div>
              <div className="group"><h4>Capabilities</h4><Chips items={PLATFORM} /></div>
              <div className="group"><h4>Talend frameworks</h4><Chips items={TALEND} /></div>
            </div>
          </article>
        </div>
        <p className="tm">Qlik, Talend, and Power BI are trademarks of their respective owners. Meridanta accelerators are independently developed and do not imply endorsement.</p>
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="cta-band" aria-labelledby="cta-h">
      <div className="wrap cta-in">
        <div>
          <h2 id="cta-h">Let’s Solve Your Next Technology Challenge.</h2>
          <p>Whether you are advancing your analytics capabilities, modernizing technology platforms, or exploring practical applications of AI, Meridanta can help you identify the right next step.</p>
        </div>
        <a className="btn btn-grad" href="#contact" onClick={(e) => go("contact", e)}>Talk to Our Team</a>
      </div>
    </section>
  );
}
