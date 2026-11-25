import { Outlet, useLocation } from "react-router-dom";
import { Head } from "vite-react-ssg";
import fontLatin from "@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2?url";
import { go } from "./utils";
import { ScrollManager, activeNavId } from "./nav";
import Header from "./components/Header";
import { Footer } from "./components/Footer";
import FloatingActions from "./components/FloatingActions";

/** Site chrome shared by every route: header, page content (<Outlet />), footer, floating buttons. */
export default function Layout() {
  const { pathname } = useLocation();
  const active = activeNavId(pathname); // the menu item of the current page (not the scroll position)

  return (
    <>
      <Head><link rel="preload" as="font" type="font/woff2" href={fontLatin} crossOrigin="anonymous" /></Head>
      <ScrollManager />
      <a className="skip" href="#main" onClick={(e) => go("main", e)}>Skip to content</a>
      <Header active={active} />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}
