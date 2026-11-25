import { useEffect, useRef, useState } from "react";
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

// Two groups; each has a sticky heading that stays under the header while that group's cards scroll past.
const GROUPS = [
  { group: "Data Integration", eyebrow: "DATA INTEGRATION" },
  { group: "Analytics", eyebrow: "ANALYTICS" },
];

/** The 1-based number of the card that is crossing the middle of the screen (shown as "2 / 4" in the sticky heading). */
function useCurrentCard(groupRef, count) {
  const [current, setCurrent] = useState(1);
  useEffect(() => {
    const cards = groupRef.current ? [...groupRef.current.querySelectorAll(".cs-card")] : [];
    if (typeof IntersectionObserver === "undefined" || !cards.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setCurrent(cards.indexOf(e.target) + 1); }),
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [groupRef, count]);
  return current;
}

function Group({ group, eyebrow, items }) {
  const ref = useRef(null);
  const current = useCurrentCard(ref, items.length);
  return (
    <div className="cap-group" ref={ref}>
      <h3 className="cap-group-head" data-count={`${current} / ${items.length}`}>{eyebrow}</h3>
      <div className="cs-deck">
        {items.map((c, i) => (
          <article key={c.slug} className="cs-card" aria-labelledby={`cs-${c.slug}`}>
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
      {GROUPS.map((d) => <Group key={d.group} {...d} items={QLIK_CAPABILITIES.filter((c) => c.eyebrow === d.eyebrow)} />)}
    </div>
  );
}
