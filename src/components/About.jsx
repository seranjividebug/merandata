import { useEffect, useRef, useState } from "react";
import { PILLARS } from "../data";
import { ABOUT, COMPANY } from "../company";
import { useSectionLink } from "../nav";
import { I } from "./Icons";
import AnimatedButton from "./AnimatedButton";
import AboutOrbit from "./AboutOrbit";
import "../about.css";

// Short highlights. Each one is a fact already on the site (company.js areaServed, the "AI-first" wording in seo.js,
// the Qlik Center of Excellence service).
const HIGHLIGHTS = [
  ["ai", "AI-first approach"],
  ["bi", "Qlik Center of Excellence"],
  ["db", "Data, Analytics & Cloud"],
  ["compass", `Serving the ${COMPANY.areaServed.join(" & ")}`],
];

/**
 * "static" (what the server renders and what a visitor without JavaScript or with reduced motion sees: the final state),
 * "armed" (animation start state), "play" (runs once when the element is on screen).
 */
function useRunOnce(ref) {
  const [phase, setPhase] = useState("static");
  useEffect(() => {
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced && typeof IntersectionObserver !== "undefined") setPhase("armed");
  }, []);
  useEffect(() => {
    if (phase !== "armed" || !ref.current) return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setPhase("play"); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [phase, ref]);
  return phase;
}

export default function About() {
  const sectionLink = useSectionLink();
  const orbitRef = useRef(null);
  const journeyRef = useRef(null);
  const orbitPhase = useRunOnce(orbitRef);
  const journeyPhase = useRunOnce(journeyRef);
  const [lead, accent] = COMPANY.slogan.split(". ");
  return (
    <section id="about" className="block about-dark cv" aria-labelledby="about-h">
      <div className="wrap">
        <div className="ab-top">
          <div className="ab-text">
            <div className="head" style={{ marginBottom: 0 }}>
              <div className="rule" />
              <h2 id="about-h">About Meridanta</h2>
            </div>
            <p className="ab-big">{lead}. <span>{accent}</span></p>
            {ABOUT.map((t) => <p key={t} className="ab-p">{t}</p>)}
            <div className="ab-actions">
              <AnimatedButton variant="light" {...sectionLink("contact")}>Let’s Talk</AnimatedButton>
              <AnimatedButton variant="ghost" {...sectionLink("services")}>Explore Services</AnimatedButton>
            </div>
          </div>
          <div ref={orbitRef} className="ab-visual">
            <AboutOrbit nodes={PILLARS.map(([ic, t]) => [ic, t.split(" ")[0]])} phase={orbitPhase} />
          </div>
        </div>

        <ol ref={journeyRef} className={"ab-journey ab-" + journeyPhase}>
          {PILLARS.map(([ic, t, d], i) => (
            <li key={t} className="ab-step" style={{ "--i": i }}>
              <div className="ab-step-top">
                <span className="ab-num" aria-hidden="true">{"0" + (i + 1)}</span>
                <span className="ab-ic">{I[ic]}</span>
              </div>
              <h3>{t}</h3>
              <p>{d}</p>
              {i < PILLARS.length - 1 && <span className="ab-link" aria-hidden="true"><i /></span>}
            </li>
          ))}
        </ol>

        <ul className="ab-chips">
          {HIGHLIGHTS.map(([ic, t]) => (
            <li key={t}><span className="ab-chip-ic" aria-hidden="true">{I[ic]}</span>{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
