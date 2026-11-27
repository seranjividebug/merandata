import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { PLATFORM, TALEND } from "../data";
import { SectionHead } from "./Icons";
import SpotlightCard, { LogoTile, SpotBody } from "./SpotlightCard";
import acceleratorsImg from "../assets/accelerators/acc-prometheus.webp";
import healthcareImg from "../assets/hero/hero-healthcare.webp";

// Main logo per accelerator (simple-icons brands only on the home page; generic icons otherwise).
const ACCELERATOR_TILES = [{ key: "prometheus" }, { key: "qlik" }, { kind: "file" }, { kind: "server" }, { kind: "cloud" }];
const PLATFORM_TILES = [{ kind: "cloud" }, { kind: "server" }, { kind: "file" }];
const TILE = 44;

const AcceleratorsVisual = (
  <>
    <img className="spot-img spot-blur" src={acceleratorsImg} alt="" width="1200" height="800" loading="lazy" decoding="async" />
    <span className="spot-tint" />
    <span className="spot-tiles">
      {ACCELERATOR_TILES.map((t, i) => <span key={i} style={{ "--i": i, display: "contents" }}><LogoTile item={t} size={TILE} /></span>)}
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

const PlatformVisual = (
  <>
    <span className="spot-tint spot-tint-solid" />
    <span className="spot-tiles">
      {PLATFORM_TILES.map((t, i) => <span key={i} style={{ "--i": i, display: "contents" }}><LogoTile item={t} size={TILE} /></span>)}
    </span>
  </>
);

const ARROW = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

/** Data Platforms & Cloud Solutions: capability chips, and the Talend frameworks behind a "+ more" toggle (they stay in the page text). */
function PlatformsCard() {
  const [more, setMore] = useState(false);
  const id = useId();
  return (
    <div className="spot spot-static">
      <div className="spot-vis" aria-hidden="true">{PlatformVisual}</div>
      <SpotBody
        pill="Platforms & implementation"
        title="Data Platforms & Cloud Solutions"
        line="Build, modernize and operate data and analytics platforms."
        chips={PLATFORM}
      >
        <ul id={id} className={"spot-chips spot-more" + (more ? " is-open" : "")} aria-label="Talend frameworks">
          {TALEND.map((c) => <li key={c}>{c}</li>)}
        </ul>
        <div className="spot-foot">
          <Link className="spot-cta" to="/services/data-engineering-analytics/">Explore<span className="sr"> Data Platforms and Cloud Solutions</span>{ARROW}</Link>
          <button type="button" className="spot-toggle" aria-expanded={more} aria-controls={id} onClick={() => setMore((v) => !v)}>
            {more ? "− less" : "+ more"}<span className="sr"> Talend frameworks</span>
          </button>
        </div>
      </SpotBody>
    </div>
  );
}

export function Products() {
  return (
    <section id="solutions" className="block alt" aria-labelledby="prod-h">
      <div className="wrap">
        <SectionHead id="prod-h" title="Solutions" intro="Explore Meridanta’s solutions for turning complex data into useful insight and accelerating the delivery of business intelligence." />
        <div className="spot-grid">
          <SpotlightCard
            to="/qlik/#accelerators"
            label="Qlik Accelerators: explore accelerators"
            title="Qlik Accelerators"
            line="Ready-made components that speed up Qlik monitoring, reporting and operations."
            chips={["5 accelerators", "Qlik Sense & Replicate", "Monitoring, reporting, logs"]}
            cta="Explore accelerators"
            visual={AcceleratorsVisual}
          />
          {/* TODO: point this at a dedicated HCInsights page when one exists. */}
          <SpotlightCard
            to="/industries/healthcare/"
            label="HCInsights: explore HCInsights"
            title="HCInsights"
            line="A turnkey healthcare insights solution that unifies clinical, operational and financial data."
            chips={["5 modules", "Clinical + financial data", "Power BI dashboards"]}
            cta="Explore HCInsights"
            visual={HealthcareVisual}
          />
          <PlatformsCard />
        </div>
        <p className="tm">Qlik, Talend, and Power BI are trademarks of their respective owners. Meridanta accelerators are independently developed and do not imply endorsement.</p>
      </div>
    </section>
  );
}
