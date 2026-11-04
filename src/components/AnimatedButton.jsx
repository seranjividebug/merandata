import { Link } from "react-router-dom";
import "../animatedButton.css";

const ARROW = (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

/**
 * Primary CTA with a fill sweep, an arrow loop and (optionally) an idle shine on hover-less screens.
 * Renders a router <Link> when `to` is given, an <a> when `href` is given, otherwise a <button>.
 * All other props (aria-*, onClick, tabIndex, type, disabled…) pass straight through.
 *
 * - variant "light": white pill, navy text (for dark backgrounds). "dark": navy pill, white text.
 * - shine: slow diagonal glint across the button (hero buttons only).
 * - arrow: show the arrow on the right (default true).
 */
export default function AnimatedButton({ variant = "light", shine = false, arrow = true, className = "", children, to, href, ...rest }) {
  const cls = ["abtn", variant === "dark" ? "abtn-dark" : "abtn-light", shine ? "abtn-shine" : "", className].filter(Boolean).join(" ");
  const inner = (
    <>
      <span className="abtn-label">{children}</span>
      {arrow && (
        <span className="abtn-arrow" aria-hidden="true">
          <span className="abtn-a1">{ARROW}</span>
          <span className="abtn-a2">{ARROW}</span>
        </span>
      )}
    </>
  );
  if (to) return <Link className={cls} to={to} {...rest}>{inner}</Link>;
  if (href !== undefined) return <a className={cls} href={href} {...rest}>{inner}</a>;
  return <button className={cls} type="button" {...rest}>{inner}</button>;
}
