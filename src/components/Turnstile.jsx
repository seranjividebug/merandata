import { useEffect, useRef } from "react";

/** Public Cloudflare Turnstile site key (set VITE_TURNSTILE_SITE_KEY in .env before building). */
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise = null;

/** Loads Cloudflare's script once, and only when the form is about to be used. */
function loadScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const el = document.createElement("script");
      el.src = SCRIPT_SRC;
      el.async = true;
      el.onload = () => resolve(window.turnstile);
      el.onerror = () => { scriptPromise = null; reject(new Error("Turnstile failed to load")); };
      document.head.appendChild(el);
    });
  }
  return scriptPromise;
}

/**
 * Cloudflare Turnstile check box. Renders nothing without a site key.
 * The script is loaded when the widget comes within 300 px of the screen, so it costs nothing on first paint.
 * `onToken(token)` gets the token, or "" when it expires or fails. Change `resetKey` to ask for a new token.
 */
export default function Turnstile({ onToken, resetKey = 0 }) {
  const box = useRef(null);
  const widget = useRef(null);
  const callback = useRef(onToken);
  callback.current = onToken;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !box.current) return undefined;
    let cancelled = false;
    const mount = () => loadScript().then((api) => {
      if (cancelled || !api || widget.current !== null) return;
      widget.current = api.render(box.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => callback.current(token),
        "expired-callback": () => callback.current(""),
        "error-callback": () => callback.current(""),
      });
    }).catch(() => callback.current(""));
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { io.disconnect(); mount(); } }, { rootMargin: "300px" });
    io.observe(box.current);
    return () => {
      cancelled = true;
      io.disconnect();
      if (widget.current !== null && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, []);

  useEffect(() => {
    if (resetKey > 0 && widget.current !== null && window.turnstile) window.turnstile.reset(widget.current);
  }, [resetKey]);

  if (!TURNSTILE_SITE_KEY) return null;
  return <div ref={box} className="turnstile" />;
}
