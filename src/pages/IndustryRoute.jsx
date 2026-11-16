import { useParams } from "react-router-dom";
import { INDUSTRIES } from "../data";
import IndustryPage from "./IndustryPage";
import NotFound from "./NotFound";

/** /industries/<slug>: one template, content from INDUSTRIES. An unknown slug shows the 404 page. */
export default function IndustryRoute() {
  const { slug } = useParams();
  const industry = INDUSTRIES.find((d) => d.slug === slug);
  return industry ? <IndustryPage industry={industry} /> : <NotFound />;
}
