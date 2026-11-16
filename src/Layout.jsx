import { useCallback, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Head } from "vite-react-ssg";
import fontLatin from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url";
import { NAV } from "./data";
import { go } from "./utils";
import { ScrollManager } from "./nav";
import Header from "./components/Header";
import { Footer, PrivacyDialog } from "./components/Footer";
import FloatingActions from "./components/FloatingActions";

/** Site chrome shared by every route: header, page content (<Outlet />), footer, floating buttons. */
export default function Layout() {
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
      <Head><link rel="preload" as="font" type="font/woff2" href={fontLatin} crossOrigin="anonymous" /></Head>
      <ScrollManager />
      <a className="skip" href="#main" onClick={(e) => go("main", e)}>Skip to content</a>
      <Header active={active} />
      <main id="main">
        <Outlet context={{ onPrivacy: openPrivacy }} />
      </main>
      <Footer onPrivacy={openPrivacy} />
      <FloatingActions />
      {privacy && <PrivacyDialog onClose={closePrivacy} />}
    </>
  );
}
