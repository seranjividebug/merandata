import { Link } from "react-router-dom";
import { useSectionLink } from "../nav";
import { QLIK_TM } from "../qlikData";

export function Breadcrumb({ trail }) {
  const link = useSectionLink();
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <ol>
        <li><a {...link("home")}>Home</a></li>
        {trail.map((t, i) => (
          <li key={t.label}>
            {i === trail.length - 1 ? <span aria-current="page">{t.label}</span> : <Link to={t.to}>{t.label}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function QlikCta({ title = "Let’s Talk About Your Qlik Roadmap.", text = "Tell us what you want to achieve with your data. A Meridanta Qlik expert will help you find the right next step.", button = "Talk to a Qlik Expert" }) {
  const link = useSectionLink();
  return (
    <section className="cta-band" aria-labelledby="qcta-h">
      <div className="wrap cta-in">
        <div>
          <h2 id="qcta-h">{title}</h2>
          <p>{text}</p>
        </div>
        <a className="btn btn-grad" {...link("contact")}>{button}</a>
      </div>
    </section>
  );
}

export const TrademarkLine = () => (
  <div className="wrap"><p className="tm qtm">{QLIK_TM}</p></div>
);
