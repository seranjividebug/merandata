import PageMeta from "../components/PageMeta";
import { Breadcrumb } from "../components/QlikBits";
import { PRIVACY_INTRO, PRIVACY_SECTIONS, PRIVACY_UPDATED } from "../privacyData";
import { COMPANY } from "../company";
import { seoFor } from "../seo";

/** /privacy/: the privacy policy. Text lives in src/privacyData.js. */
export default function Privacy() {
  return (
    <>
      <PageMeta path="/privacy/" />
      <section className="block" aria-labelledby="privacy-h">
        <div className="wrap">
          <Breadcrumb trail={seoFor("/privacy/").trail} light />
          <div className="head">
            <div className="rule" />
            <h1 id="privacy-h">Privacy Policy</h1>
            <p>{PRIVACY_INTRO}</p>
          </div>
          <div className="policy">
            <p className="policy-date">Last updated: {PRIVACY_UPDATED}</p>
            {PRIVACY_SECTIONS.map((s) => (
              <section key={s.heading} aria-labelledby={"pp-" + s.heading.toLowerCase().replace(/\W+/g, "-")}>
                <h2 id={"pp-" + s.heading.toLowerCase().replace(/\W+/g, "-")}>{s.heading}</h2>
                {s.paragraphs.map((t) => (
                  <p key={t}>{t.includes(COMPANY.email) ? <>{t.split(COMPANY.email)[0]}<a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>{t.split(COMPANY.email).slice(1).join(COMPANY.email)}</> : t}</p>
                ))}
                {s.items && <ul>{s.items.map((i) => <li key={i}>{i}</li>)}</ul>}
                {s.after && s.after.map((t) => <p key={t}>{t}</p>)}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
