import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { go, scrollToEl } from "./utils";
import { interestForServicePath } from "./services";

/** Menu items that are pages of their own (they used to be sections of the home page). */
export const PAGE_PATHS = { industries: "/industries/", solutions: "/solutions/", about: "/about/" };

/** Which menu item is current for a path: follows the page, not the scroll position. */
export function activeNavId(pathname) {
  if (pathname === "/") return "home";
  if (/^\/(services|qlik)(\/|$)/.test(pathname)) return "services";
  const hit = Object.entries(PAGE_PATHS).find(([, p]) => pathname === p.slice(0, -1) || pathname.startsWith(p));
  return hit ? hit[0] : "";
}

/** The service of interest implied by the page a contact link sits on (null on pages with no single service). */
export const interestForPath = (pathname) => (/^\/qlik(\/|$)/.test(pathname) ? "qlik" : /^\/industries\/healthcare(\/|$)/.test(pathname) ? "healthcare" : interestForServicePath(pathname));

/**
 * Link props for a section of the home page that work from any route.
 * On "/" it smooth-scrolls; elsewhere it navigates to "/#id" and ScrollManager scrolls.
 * `id` "industries", "solutions" and "about" are pages; "contact" is the /contact page (not a home section): the link keeps the service of interest
 * (?interest=qlik on the Qlik page, ?interest=healthcare on the Healthcare page, or `interest` when given).
 * `after` runs on click (e.g. close the mobile menu).
 */
export function useSectionLink() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return useCallback((id, after, interest) => {
    if (id === "contact") {
      const key = interest || interestForPath(pathname);
      const search = key ? `?interest=${key}` : "";
      return {
        href: `/contact/${search}`,
        onClick: (e) => {
          if (after) after();
          if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
          e.preventDefault();
          navigate({ pathname: "/contact/", search });
        },
      };
    }
    if (PAGE_PATHS[id]) {
      return {
        href: PAGE_PATHS[id],
        onClick: (e) => {
          if (after) after();
          if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
          e.preventDefault();
          navigate(PAGE_PATHS[id]);
        },
      };
    }
    return {
      href: id === "home" ? "/" : `/#${id}`,
      onClick: (e) => {
        if (after) after();
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
        if (pathname === "/") { go(id, e); return; }
        e.preventDefault();
        navigate({ pathname: "/", hash: id === "home" ? "" : "#" + id });
      },
    };
  }, [pathname, navigate]);
}

/** Scroll to the hash target (or the top) on every navigation. */
export function ScrollManager() {
  const { pathname, hash, search } = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    // Old links to the home page's contact section now go to the /contact page.
    if (pathname === "/" && hash === "#contact") { navigate({ pathname: "/contact/", search }, { replace: true }); return undefined; }
    // Old links to the sections that became pages (/#about, /#solutions, /#industries) go to the new pages.
    if (pathname === "/" && PAGE_PATHS[hash.slice(1)]) { navigate(PAGE_PATHS[hash.slice(1)], { replace: true }); return undefined; }
    if (!hash) { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); return undefined; }
    const t = setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) scrollToEl(el);
    }, 60);
    return () => clearTimeout(t);
  }, [pathname, hash, search, navigate]);
  return null;
}
