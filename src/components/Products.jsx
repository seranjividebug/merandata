import { PLATFORM, TALEND } from "../data";
import { I, SectionHead } from "./Icons";
import SpotlightCard, { LogoTile } from "./SpotlightCard";
import acceleratorsImg from "../assets/accelerators/acc-prometheus.webp";
import healthcareImg from "../assets/hero/hero-healthcare.webp";

// Main logo per accelerator (simple-icons brands only on the home page; generic icons otherwise).
const ACCELERATOR_TILES = [{ key: "prometheus" }, { key: "qlik" }, { kind: "file" }, { kind: "server" }, { kind: "cloud" }];

const AcceleratorsVisual = (
  <>
    <img className="spot-img spot-blur" src={acceleratorsImg} alt="" width="1200" height="800" loading="lazy" decoding="async" />
    <span className="spot-tint" />
    <span className="spot-tiles">
      {ACCELERATOR_TILES.map((t, i) => <span key={i} style={{ "--i": i, display: "contents" }}><LogoTile item={t} /></span>)}
    </span>
  </>
);

const HealthcareVisual = (
  <>
    <img className="spot-img" src={healthcareImg} alt="" width="1600" height="520" loading="lazy" decoding="async" />
    <span className="spot-tint" />
    <svg className="spot-beat" viewBox="0 0 400 56" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path pathLength="1" d="M0 30 H110 L126 30 L138 8 L152 50 L164 18 L174 30 H260 L274 30 L286 12 L298 46 L308 30 H400" />
    </svg>
  </>
);

const Chips = ({ items, label }) => (
  <div className="chips" aria-label={label}>{items.map((t) => <span key={t} className="chip">{t}</span>)}</div>
);

export function Products() {
  return (
    <section id="solutions" className="block alt" aria-labelledby="prod-h">
      <div className="wrap">
        <SectionHead id="prod-h" title="Products & Solutions" intro="Explore Meridanta’s solutions for turning complex data into useful insight and accelerating the delivery of business intelligence." />
        <div className="spot-grid">
          <SpotlightCard
            to="/qlik#accelerators"
            label="Qlik Accelerators: explore accelerators"
            title="Qlik Accelerators"
            line="Ready-made components that speed up Qlik monitoring, reporting and operations."
            chips={["5 accelerators", "Qlik Sense & Replicate", "Monitoring, reporting, logs"]}
            cta="Explore accelerators"
            visual={AcceleratorsVisual}
          />
          {/* TODO: point this at a dedicated HCInsights page when one exists. */}
          <SpotlightCard
            to="/industries/healthcare"
            label="HCInsights: explore HCInsights"
            title="HCInsights"
            line="A turnkey healthcare insights solution that unifies clinical, operational and financial data."
            chips={["5 modules", "Clinical + financial data", "Power BI dashboards"]}
            cta="Explore HCInsights"
            visual={HealthcareVisual}
          />
        </div>
        <div className="prods">
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
