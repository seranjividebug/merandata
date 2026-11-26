import { useSectionLink } from "../nav";
import PageMeta from "../components/PageMeta";
import { I } from "../components/Icons";
import { Breadcrumb, QlikCta } from "../components/QlikBits";
import AnimatedButton from "../components/AnimatedButton";
import CapabilityRail from "../components/CapabilityRail";
import { seoFor } from "../seo";
import Picture from "../components/Picture";
import { responsiveImage } from "../images";
import { servicePath } from "../services";

/**
 * The template for every /services/<slug>/ page. All content comes from the page's entry in src/services.js: a hero,
 * any number of sections of capability cards, and a closing call-to-action band. Contact buttons keep the service of
 * interest (?interest=...) because nav.js reads it from the page address.
 */
export default function ServicePage({ page }) {
  const link = useSectionLink();
  const path = servicePath(page);
  const { hero, heroImage: bg } = page;
  return (
    <>
      <PageMeta path={path} />
      <section className={"qhero sp-hero" + (bg ? " has-bg" : "") + (bg && bg.compact ? " is-compact" : "")} aria-labelledby="sp-h1">
        {bg && (
          <div className="sp-hero-bg">
            <Picture className="sp-hero-img" image={responsiveImage(bg.base, bg.widths, bg.full)} sizes="100vw" alt={bg.alt} width={bg.full} height={bg.height} decoding="async" fetchpriority="high" />
          </div>
        )}
        <div className="wrap">
          <Breadcrumb trail={seoFor(path).trail} />
          <div className="sp-hero-in">
            <div className="qeyebrow">{hero.eyebrow}</div>
            <h1 id="sp-h1">{hero.h1}</h1>
            {hero.support && <p className="sp-support">{hero.support}</p>}
            {hero.paragraphs.map((t) => <p key={t} className="lede">{t}</p>)}
            <div className="qhero-ctas">
              <AnimatedButton shine className="hero-btn" {...link("contact")}>{hero.cta}</AnimatedButton>
            </div>
          </div>
          {!bg && <span className="sp-hero-art" aria-hidden="true">{I[page.icon]}</span>}
        </div>
      </section>

      {page.sections.map((s) => <CapabilityRail key={s.id} section={s} tagline={hero.h1} />)}

      <QlikCta title={page.cta.title} text={page.cta.text} button={page.cta.button} />
    </>
  );
}
