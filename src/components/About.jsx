import { PILLARS } from "../data";
import { ABOUT, COMPANY } from "../company";
import { useSectionLink } from "../nav";
import { I } from "./Icons";
import AnimatedButton from "./AnimatedButton";
import "../about.css";

/** About: statement and copy on the left, the three principles as a compact list on the right. All of it is plain HTML. */
export default function About() {
  const sectionLink = useSectionLink();
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
            </div>
          </div>
          <ul className="ab-list">
            {PILLARS.map(([ic, t, d]) => (
              <li key={t}>
                <span className="ab-ic" aria-hidden="true">{I[ic]}</span>
                <div><h3>{t}</h3><p>{d}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
