import { Head } from "vite-react-ssg";
import { NOT_FOUND_SEO, SITE, absoluteUrl, canonicalUrl, seoFor } from "../seo";
import { schemaJson } from "../schema";

/**
 * Head tags for a page, written into the prerendered HTML at build time:
 * title, description, canonical, Open Graph, Twitter Card and JSON-LD. Values come from src/seo.js and src/schema.js.
 * Pass `path` (e.g. "/qlik/") for an indexable page, or `notFound` for the 404 page.
 */
export default function PageMeta({ path, notFound = false }) {
  const page = notFound ? NOT_FOUND_SEO : seoFor(path);
  if (!page) return null;
  const image = absoluteUrl(SITE.ogImage);
  return (
    <Head>
      <title>{page.title}</title>
      <meta name="description" content={page.description} />
      {(notFound || page.noindex) && <meta name="robots" content="noindex" />}
      {!notFound && <link rel="canonical" href={canonicalUrl(path)} />}
      {!notFound && <meta property="og:url" content={canonicalUrl(path)} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={SITE.locale} />
      <meta property="og:title" content={page.title} />
      <meta property="og:description" content={page.description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content={String(SITE.ogImageWidth)} />
      <meta property="og:image:height" content={String(SITE.ogImageHeight)} />
      <meta property="og:image:alt" content={SITE.ogImageAlt} />
      <meta name="twitter:card" content="summary_large_image" />
      {SITE.twitterSite && <meta name="twitter:site" content={SITE.twitterSite} />}
      <meta name="twitter:title" content={page.title} />
      <meta name="twitter:description" content={page.description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={SITE.ogImageAlt} />
      {!notFound && <script type="application/ld+json">{schemaJson(path)}</script>}
    </Head>
  );
}
