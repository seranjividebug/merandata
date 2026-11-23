import { useParams } from "react-router-dom";
import { servicePageBySlug } from "../services";
import ServicePage from "./ServicePage";
import NotFound from "./NotFound";

/** /services/<slug>: one template, content from SERVICE_PAGES (src/services.js). An unknown slug shows the 404 page. */
export default function ServiceRoute() {
  const { slug } = useParams();
  const page = servicePageBySlug(slug);
  return page ? <ServicePage page={page} /> : <NotFound />;
}
