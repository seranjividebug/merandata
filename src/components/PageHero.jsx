import { Breadcrumb } from "./QlikBits";
import { seoFor } from "../seo";
import "../pageHero.css";

/** Compact hero (about 280px) for the section pages: breadcrumb, h1 and one or two lines of intro. */
export default function PageHero({ id, path, title, intro }) {
  return (
    <section className="qhero page-hero" aria-labelledby={id}>
      <div className="wrap">
        <Breadcrumb trail={seoFor(path).trail} />
        <div className="page-hero-in">
          <h1 id={id}>{title}</h1>
          <p className="lede">{intro}</p>
        </div>
      </div>
    </section>
  );
}
