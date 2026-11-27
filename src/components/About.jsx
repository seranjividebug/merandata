import { useEffect, useRef, useState } from "react";
import { PILLARS } from "../data";
import { ABOUT, COMPANY } from "../company";
import { useSectionLink } from "../nav";
import AnimatedButton from "./AnimatedButton";
import AboutVenn from "./AboutVenn";
import "../about.css";

/**
 * "static" (server-rendered HTML and reduced motion: the final state), "armed" (animation start state),
 * "play" (runs once when the element is on screen).
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
    }, { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [phase, ref]);
  return phase;
}

/** About: a light band. Statement and copy on the left, the "Approach Venn" diagram with its legend on the right. */
export default function About() {
  const sectionLink = useSectionLink();
  const vennRef = useRef(null);
  const phase = useRunOnce(vennRef);
  const [lead, accent] = COMPANY.slogan.split(". ");
  return (
    <section id="about" className="block about-light" aria-labelledby="about-h">
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
              <AnimatedButton variant="dark" {...sectionLink("contact")}>Let’s Talk</AnimatedButton>
            </div>
          </div>
          <div ref={vennRef} className="ab-diagram">
            <AboutVenn pillars={PILLARS} phase={phase} />
          </div>
        </div>
      </div>
    </section>
  );
}
