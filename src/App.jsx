import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { INDUSTRIES, NAV } from "./data";
import { go } from "./utils";
import { ScrollManager } from "./nav";
import Header from "./components/Header";
import { Footer, PrivacyDialog } from "./components/Footer";
import FloatingActions from "./components/FloatingActions";
import Home from "./pages/Home";
import QlikOverview from "./pages/QlikOverview";
import IndustryPage from "./pages/IndustryPage";
import NotFound from "./pages/NotFound";

export default function App() {
  const { pathname } = useLocation();
  const [active, setActive] = useState("home");
  const [privacy, setPrivacy] = useState(false);
  const openPrivacy = useCallback(() => setPrivacy(true), []);
  const closePrivacy = useCallback(() => setPrivacy(false), []);

  // Highlight the nav item for the home-page section in view
  useEffect(() => {
    if (pathname !== "/") { setActive(""); return undefined; }
    const ids = [...NAV.map((n) => n.id), "contact"];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) setActive(en.target.id === "contact" ? "" : en.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => { const el = document.getElementById(id); el && io.observe(el); });
    return () => io.disconnect();
  }, [pathname]);

  return (
    <>
      <ScrollManager />
      <a className="skip" href="#main" onClick={(e) => go("main", e)}>Skip to content</a>
      <Header active={active} />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home onPrivacy={openPrivacy} />} />
          <Route path="/qlik" element={<QlikOverview />} />
          <Route path="/qlik/*" element={<Navigate to="/qlik#capabilities" replace />} />
          {INDUSTRIES.map((d) => <Route key={d.slug} path={"/industries/" + d.slug} element={<IndustryPage industry={d} />} />)}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer onPrivacy={openPrivacy} />
      <FloatingActions />
      {privacy && <PrivacyDialog onClose={closePrivacy} />}
    </>
  );
}
