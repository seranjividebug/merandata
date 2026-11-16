import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta";

export default function NotFound() {
  return (
    <>
    <PageMeta notFound />
    <section className="block" aria-labelledby="nf-h">
      <div className="wrap nf">
        <div className="head">
          <div className="rule" />
          <h1 id="nf-h">Page not found</h1>
          <p>The page you are looking for does not exist or has moved.</p>
        </div>
        <div className="nf-links">
          <Link className="btn btn-dark" to="/">Back to home</Link>
          <Link className="btn btn-outline" to="/qlik">Explore Qlik</Link>
        </div>
      </div>
    </section>
    </>
  );
}
