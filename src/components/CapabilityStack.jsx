import { useEffect, useRef } from "react";
import { QLIK_CAPABILITIES } from "../qlikData";

import capDataReplication from "../assets/capabilities/cap-data-replication.webp";
import capTalendEtl from "../assets/capabilities/cap-talend-etl.webp";
import capDataQuality from "../assets/capabilities/cap-data-quality.webp";
import capOpenLakehouse from "../assets/capabilities/cap-open-lakehouse.webp";
import capVisualization from "../assets/capabilities/cap-visualization.webp";
import capEnterpriseReporting from "../assets/capabilities/cap-enterprise-reporting.webp";
import capAutomation from "../assets/capabilities/cap-automation.webp";

// Keyed by QLIK_CAPABILITIES[].image; static imports so Vite fingerprints and bundles each file.
const IMAGES = {
  "cap-data-replication": capDataReplication,
  "cap-talend-etl": capTalendEtl,
  "cap-data-quality": capDataQuality,
  "cap-open-lakehouse": capOpenLakehouse,
  "cap-visualization": capVisualization,
  "cap-enterprise-reporting": capEnterpriseReporting,
  "cap-automation": capAutomation,
};
const warnMissing = (name) => console.warn(`CapabilityStack: image "${name}.webp" failed to load from src/assets/capabilities/`);

const STACK_MQ = "(min-width: 1024px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)";
const DECKS = [
  { group: "Data Integration", eyebrow: "DATA INTEGRATION" },
  { group: "Analytics", eyebrow: "ANALYTICS" },
];

/** Sets --k on each card to the number of later cards in its deck that have reached their sticky top. */
function useDeckDepth(deckRef) {
  useEffect(() => {
    const deck = deckRef.current;
    if (!deck) return undefined;
    const mq = window.matchMedia(STACK_MQ);
    const cards = [...deck.children];
    let frame = 0;

    const reset = () => cards.forEach((c) => c.style.removeProperty("--k"));

    const update = () => {
      frame = 0;
      const reached = cards.map((c) => c.getBoundingClientRect().top <= (parseFloat(getComputedStyle(c).top) || 0) + 1);
      cards.forEach((c, i) => {
        const k = reached.slice(i + 1).filter(Boolean).length;
        if (c.style.getPropertyValue("--k") !== String(k)) c.style.setProperty("--k", String(k));
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const sync = () => { if (mq.matches) update(); else reset(); };

    sync();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    mq.addEventListener("change", sync);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mq.removeEventListener("change", sync);
    };
  }, [deckRef]);
}

function Deck({ group, items }) {
  const deckRef = useRef(null);
  useDeckDepth(deckRef);
  return (
    <div className="cs-group">
      <h3 className="cs-group-h">{group}</h3>
      <div className="cs-deck" ref={deckRef}>
        {items.map((c, i) => (
          <article key={c.slug} className="cs-card" style={{ "--i": i, "--r": items.length - 1 - i }} aria-labelledby={`cs-${c.slug}`}>
            <h4 id={`cs-${c.slug}`} className="cs-title">{c.title}</h4>
            <div className={"cs-row" + (i % 2 ? " is-flip" : "")}>
              <img className="cs-img" src={IMAGES[c.image]} width="1200" height="800" alt={c.alt} loading="lazy" decoding="async" onError={() => warnMissing(c.image)} />
              <div className="cs-text">
                <p className="cs-intro">{c.intro}</p>
                <ul className="cs-bullets">
                  {c.bullets.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function CapabilityStack() {
  return (
    <div className="cs-list">
      {DECKS.map((d) => <Deck key={d.group} group={d.group} items={QLIK_CAPABILITIES.filter((c) => c.eyebrow === d.eyebrow)} />)}
    </div>
  );
}
