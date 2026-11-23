// JSON-LD (schema.org) for every page, built from company.js, seo.js and the content data files.
// <PageMeta> writes the result into each prerendered page, so adding a service, offering or case study
// updates the structured data automatically.
import { SERVICES } from "./data";
import { caseStudies, FEATURED_CASE_IDS } from "./caseStudies";
import { COMPANY, knowsAbout, socialProfiles } from "./company";
import { QLIK_JOURNEY, QLIK_OFFERINGS } from "./qlikData";
import { SITE, absoluteUrl, canonicalUrl, seoFor } from "./seo";
import { SERVICE_PAGES, servicePath } from "./services";

const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const ORG_ID = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;
const ref = (id) => ({ "@id": id });

/** Drops empty values so unconfirmed company details never reach the structured data. */
function clean(value) {
  if (Array.isArray(value)) {
    const items = value.map(clean).filter((v) => v !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const c = clean(v);
      if (c !== undefined) out[k] = c;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return value === "" || value === null || value === undefined ? undefined : value;
}

const areaServed = () => COMPANY.areaServed.map((name) => ({ "@type": "Country", name }));

function organization() {
  const a = COMPANY.address;
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url: SITE.url + "/",
    logo: { "@type": "ImageObject", url: absoluteUrl(COMPANY.logo), width: COMPANY.logoSize, height: COMPANY.logoSize },
    image: absoluteUrl(SITE.ogImage),
    description: COMPANY.description,
    slogan: COMPANY.slogan,
    foundingDate: COMPANY.foundingDate,
    email: COMPANY.email,
    telephone: COMPANY.phone,
    address: Object.values(a).some(Boolean) ? { "@type": "PostalAddress", ...a } : undefined,
    location: Object.values(a).some(Boolean) ? { "@type": "Place", name: COMPANY.addressLabel, address: { "@type": "PostalAddress", ...a } } : undefined,
    areaServed: areaServed(),
    sameAs: socialProfiles().map((s) => s.url),
    knowsAbout: knowsAbout(),
  };
}

const website = () => ({
  "@type": "WebSite",
  "@id": SITE_ID,
  url: SITE.url + "/",
  name: COMPANY.name,
  description: COMPANY.description,
  inLanguage: SITE.language,
  publisher: ref(ORG_ID),
});

function webPage(page) {
  return {
    "@type": page.path === "/contact/" ? "ContactPage" : "WebPage",
    "@id": `${canonicalUrl(page.path)}#webpage`,
    url: canonicalUrl(page.path),
    name: page.title,
    description: page.description,
    inLanguage: SITE.language,
    isPartOf: ref(SITE_ID),
    about: ref(ORG_ID),
    breadcrumb: page.trail ? ref(`${canonicalUrl(page.path)}#breadcrumb`) : undefined,
  };
}

function breadcrumbs(page) {
  const items = [{ name: "Home", url: SITE.url + "/" }];
  page.trail.forEach((t, i) => items.push({ name: t.label, url: i === page.trail.length - 1 ? canonicalUrl(page.path) : absoluteUrl(t.to) }));
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl(page.path)}#breadcrumb`,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url })),
  };
}

const service = (id, name, description, url) => ({
  "@type": "Service",
  "@id": `${SITE.url}/#service-${id}`,
  name,
  description,
  url,
  provider: ref(ORG_ID),
  areaServed: areaServed(),
});

// A pillar's page is only named as the service URL once the page is indexable (drafts are noindex).
const pageUrl = (s) => (s.href && !seoFor(s.href)?.noindex ? absoluteUrl(s.href) : `${SITE.url}/#services`);
const homeServices = () => SERVICES.map((s) => service(slug(s.title), s.title, s.desc, pageUrl(s)));

/** The Service of a /services/<slug>/ page: the same @id as the home page's, so the two describe one service. */
const servicePageService = (path) => {
  const p = SERVICE_PAGES.find((x) => servicePath(x) === path);
  if (!p) return null;
  const card = SERVICES.find((s) => s.title === p.title);
  return { ...service(slug(p.title), p.title, card ? card.desc : p.seo.description, canonicalUrl(path)), serviceType: p.title };
};

const qlikServices = () => QLIK_OFFERINGS.map((o, i) =>
  service(`qlik-${slug(o.title)}`, `Qlik Center of Excellence: ${o.title}`, QLIK_JOURNEY[i].description, `${canonicalUrl("/qlik/")}#qlik-services`));

function caseStudyList() {
  // Same order as the page: featured cases first, then the rest in data order.
  const published = caseStudies.filter((c) => c.published);
  const featured = FEATURED_CASE_IDS.map((id) => published.find((c) => c.id === id)).filter(Boolean);
  const list = [...featured, ...published.filter((c) => !featured.includes(c))];
  return {
    "@type": "ItemList",
    "@id": `${canonicalUrl("/qlik/")}#case-studies`,
    name: "Proven Outcomes: Meridanta Qlik case studies",
    numberOfItems: list.length,
    itemListElement: list.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, url: `${canonicalUrl("/qlik/")}#case-${c.id}`, description: c.summary })),
  };
}

/**
 * FAQPage for a page. Only call this for FAQs that are visible on the page (mark them with data-faq).
 * `faqs` is [{ question, answer }]. No page has FAQs yet, so none is emitted.
 */
export const faqPage = (path, faqs) => ({
  "@type": "FAQPage",
  "@id": `${canonicalUrl(path)}#faq`,
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
});

/** The JSON-LD document (one @graph) for an indexable page path such as "/qlik/". */
export function schemaFor(path) {
  const page = seoFor(path);
  if (!page) return null;
  const graph = [organization(), website(), webPage(page)];
  if (page.trail) graph.push(breadcrumbs(page));
  if (path === "/") graph.push(...homeServices());
  const sp = servicePageService(path);
  if (sp) graph.push(sp);
  if (path === "/qlik/") graph.push(...qlikServices(), caseStudyList());
  if (page.faqs?.length) graph.push(faqPage(path, page.faqs));
  return clean({ "@context": "https://schema.org", "@graph": graph });
}

/** Safe to place inside <script type="application/ld+json">. */
export const schemaJson = (path) => {
  const doc = schemaFor(path);
  return doc ? JSON.stringify(doc).replace(/</g, "\\u003c") : "";
};
