import { Link } from "react-router-dom";
import { usePageTitle, useSectionLink } from "../nav";
import { I, SectionHead } from "../components/Icons";
import { INDUSTRY_ART } from "../components/IndustryArt";
import { Breadcrumb, QlikCta } from "../components/QlikBits";

const CHAPTERS = [["challenge", "Industry challenges", "ch"], ["opportunity", "Technology opportunities", "op"], ["capability", "Our capabilities", "ca"]];

/** One template for every /industries/<slug> page; the content comes from INDUSTRIES. */
export default function IndustryPage({ industry: d }) {
  usePageTitle(`${d.tab} | Meridanta`, d.cardDesc);
  const link = useSectionLink();
  const Art = INDUSTRY_ART[d.key];
  return (
    <>
      <section className="qhero" aria-labelledby="ind-h1">
        <div className="wrap">
          <Breadcrumb trail={[{ label: "Industries", to: "/#industries" }, { label: d.tab }]} />
          <div className="qhero-in">
            <div>
              <div className="qeyebrow">{d.eyebrow}</div>
              <h1 id="ind-h1">{d.tagline}</h1>
              <p className="lede">{d.cardDesc}</p>
              <div className="qhero-ctas">
                <a className="btn btn-grad" {...link("contact")}>Talk to Our Team</a>
                <Link className="btn btn-ghost-light" to="/#industries">All industries</Link>
              </div>
            </div>
            <div className="ip-art"><Art /></div>
          </div>
        </div>
      </section>

      <section className="block" aria-labelledby="ip-h">
        <div className="wrap">
          <SectionHead id="ip-h" title={`${d.tab}: challenges, opportunities and capabilities`} />
          <div className="story ip-story">
            {CHAPTERS.map(([ic, t, k]) => (
              <div key={t} className="chapter">
                <div className="mk">{I[ic]}</div>
                <div><h3>{t}</h3><p>{d[k]}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QlikCta title="Let’s Talk About Your Industry Goals." text={`Tell us what you want to achieve in ${d.tab.toLowerCase()}. A Meridanta expert will help you find the right next step.`} button="Talk to Our Team" />
    </>
  );
}
