import { Head } from "vite-react-ssg";

/** Per-page <title> and meta description. Rendered into the static HTML at build time and kept in sync on the client. */
export default function PageMeta({ title, description, noindex = false }) {
  return (
    <Head>
      <title>{title}</title>
      {noindex && <meta name="robots" content="noindex" />}
      {description && <meta name="description" content={description} />}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
    </Head>
  );
}
