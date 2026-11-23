import { PILLARS } from "../data";
import { ABOUT, COMPANY } from "../company";
import { I } from "./Icons";

export default function About() {
  return (
    <section id="about" className="block alt cv" aria-labelledby="about-h">
      <div className="wrap">
        <div className="about">
          <div>
            <div className="head" style={{ marginBottom: 0 }}>
              <div className="rule" />
              <h2 id="about-h">About Meridanta</h2>
            </div>
            <p className="about-big" style={{ marginTop: "28px" }}>
              {COMPANY.slogan.split(". ")[0]}. <span>{COMPANY.slogan.split(". ")[1]}</span>
            </p>
          </div>
          <div className="about-copy">
            {ABOUT.map((t) => <p key={t}>{t}</p>)}
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
