import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { go, REDUCED } from "./utils";

/** The service of interest implied by the page a contact link sits on (null on pages with no single service). */
export const interestForPath = (pathname) => (/^\/qlik(\/|$)/.test(pathname) ? "qlik" : /^\/industries\/healthcare(\/|$)/.test(pathname) ? "healthcare" : null);

/**
 * Link props for a section of the home page that work from any route.
 * On "/" it smooth-scrolls; elsewhere it navigates to "/#id" and ScrollManager scrolls.
 * `after` runs on click (e.g. close the mobile menu).
 */
export function useSectionLink() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return useCallback((id, after) => {
    // Contact links from the Qlik and Healthcare pages pre-select that service in the form.
    const interest = id === "contact" && pathname !== "/" ? interestForPath(pathname) : null;
    const search = interest ? `?interest=${interest}` : "";
    return {
      href: id === "home" ? "/" : `/${search}#${id}`,
      onClick: (e) => {
        if (after) after();
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
        if (pathname === "/") { go(id, e); return; }
        e.preventDefault();
        navigate({ pathname: "/", search, hash: id === "home" ? "" : "#" + id });
      },
    };
  }, [pathname, navigate]);
}

/** Scroll to the hash target (or the top) on every navigation. */
export function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); return undefined; }
    const t = setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
    }, 60);
    return () => clearTimeout(t);
  }, [pathname, hash]);
  return null;
}
