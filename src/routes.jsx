import { Navigate, useParams } from "react-router-dom";
import { INDUSTRIES } from "./data";
import Layout from "./Layout";
import Home from "./pages/Home";
import QlikOverview from "./pages/QlikOverview";
import IndustryPage from "./pages/IndustryPage";
import NotFound from "./pages/NotFound";

/** /industries/<slug>: one template, content from INDUSTRIES. An unknown slug shows the 404 page. */
function IndustryRoute() {
  const { slug } = useParams();
  const industry = INDUSTRIES.find((d) => d.slug === slug);
  return industry ? <IndustryPage industry={industry} /> : <NotFound />;
}

/**
 * Public routes. Every path returned here (including one page per INDUSTRIES entry) is prerendered
 * to its own HTML file at build time, so adding an industry adds its page automatically.
 */
export const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "qlik", element: <QlikOverview /> },
      { path: "qlik/*", element: <Navigate to="/qlik#capabilities" replace /> },
      {
        path: "industries/:slug",
        element: <IndustryRoute />,
        getStaticPaths: () => INDUSTRIES.map((d) => "industries/" + d.slug),
      },
      // Also prerendered once as /404 (see ssgOptions in vite.config.js) and served by the host for unknown URLs.
      { path: "*", element: <NotFound /> },
    ],
  },
];
