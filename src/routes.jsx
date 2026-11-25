import { Navigate } from "react-router-dom";
import { INDUSTRIES } from "./data";
import { SERVICE_PAGES } from "./services";
import Layout from "./Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import ContactPage from "./pages/ContactPage";

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
      { path: "contact", element: <ContactPage /> },
      { path: "privacy", element: <Privacy /> },
      { path: "qlik", lazy: async () => ({ Component: (await import("./pages/QlikOverview")).default }), entry: "src/pages/QlikOverview.jsx" },
      {
        path: "services/:slug",
        lazy: async () => ({ Component: (await import("./pages/ServiceRoute")).default }),
        entry: "src/pages/ServiceRoute.jsx",
        getStaticPaths: () => SERVICE_PAGES.map((s) => "services/" + s.slug),
      },
      { path: "qlik/*", element: <Navigate to="/qlik/#capabilities" replace /> },
      {
        path: "industries/:slug",
        lazy: async () => ({ Component: (await import("./pages/IndustryRoute")).default }),
        entry: "src/pages/IndustryRoute.jsx",
        getStaticPaths: () => INDUSTRIES.map((d) => "industries/" + d.slug),
      },
      // Also prerendered once as /404 (see ssgOptions in vite.config.js) and served by the host for unknown URLs.
      { path: "*", element: <NotFound /> },
    ],
  },
];
