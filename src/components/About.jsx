import { PILLARS } from "../data";
import { I } from "./Icons";

export default function About() {
  return (
    <section id="about" className="block" aria-labelledby="about-h">
      <div className="wrap">
        <div className="about">
          <div>
            <div className="head" style={{ marginBottom: 0 }}>
              <div className="rule" />
              <h2 id="about-h">About Meridanta</h2>
            </div>
            <p className="about-big" style={{ marginTop: "28px" }}>
              Technology Expertise. <span>Business Outcomes.</span>
            </p>
          </div>
          <div className="about-copy">
            <p>Meridanta focuses on AI, Data & Analytics, and Cloud solutions that help organizations address business challenges through practical technology and disciplined delivery.</p>
            <p>Our approach brings together business understanding, engineering expertise, and outcome-oriented execution to help customers turn technology opportunities into meaningful results.</p>
            <div className="pillars">
              {PILLARS.map(([ic, t, d]) => (
                <div key={t} className="pillar">
                  <div className="icon">{I[ic]}</div>
                  <div><h3>{t}</h3><p>{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
