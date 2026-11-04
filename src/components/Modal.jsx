import { useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { REDUCED } from "../utils";
import { CIcon } from "./caseIcons";
import "../modal.css";

const FOCUSABLE = 'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';
const DURATION = 300;

/** Transform that places the dialog over the element it came from. */
function fromOrigin(dialog, origin) {
  const to = dialog.getBoundingClientRect();
  if (!origin || !origin.isConnected || !to.width) return "translateY(16px) scale(.96)";
  const from = origin.getBoundingClientRect();
  const dx = from.left + from.width / 2 - (to.left + to.width / 2);
  const dy = from.top + from.height / 2 - (to.top + to.height / 2);
  return `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})`;
}

/** Lock page scroll and hide the page behind the dialog from assistive tech while it is mounted. */
function useModalLock() {
  useEffect(() => {
    const root = document.getElementById("root");
    const html = document.documentElement;
    const gap = window.innerWidth - html.clientWidth;
    const prev = { overflow: html.style.overflow, pad: document.body.style.paddingRight };
    html.style.overflow = "hidden";
    if (gap > 0) document.body.style.paddingRight = gap + "px";
    root?.setAttribute("inert", "");
    return () => {
      html.style.overflow = prev.overflow;
      document.body.style.paddingRight = prev.pad;
      root?.removeAttribute("inert");
    };
  }, []);
}

/**
 * Shared modal dialog: portal, backdrop, scale-from-origin animation (300ms, off for reduced motion),
 * focus trap, Esc / backdrop / X to close, page scroll lock. Content goes in `children`, which may be
 * a function receiving `{ close }`.
 *
 * - `onClose({ restoreFocus })` runs after the exit animation; the owner unmounts the modal and
 *   returns focus to whatever opened it.
 * - `origin` is the element the dialog grows from.
 * - `onArrow(-1 | 1)` handles the left / right arrow keys.
 */
export default function Modal({ labelledBy, closeLabel, origin, dark, onClose, onArrow, children }) {
  const dialog = useRef(null);
  const backdrop = useRef(null);
  const closing = useRef(false);
  const downOnBackdrop = useRef(false);
  useModalLock();

  const animate = (reverse, done) => {
    const d = dialog.current;
    const b = backdrop.current;
    if (!d || !b || REDUCED || typeof d.animate !== "function") { done?.(); return; }
    const opts = { duration: reverse ? 220 : DURATION, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" };
    const frames = [{ transform: fromOrigin(d, origin), opacity: 0.2 }, { transform: "none", opacity: 1 }];
    const a = d.animate(reverse ? [...frames].reverse() : frames, opts);
    const fade = [{ opacity: 0 }, { opacity: 1 }];
    b.animate(reverse ? [...fade].reverse() : fade, { ...opts, easing: "ease" });
    if (done) a.onfinish = done;
  };

  const close = (restoreFocus = true, instant = false) => {
    if (closing.current) return;
    closing.current = true;
    if (instant) onClose({ restoreFocus });
    else animate(true, () => onClose({ restoreFocus }));
  };

  useLayoutEffect(() => {
    animate(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { dialog.current?.querySelector(".cm-x")?.focus({ preventScroll: true }); }, []);

  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (onArrow && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      e.preventDefault();
      onArrow(e.key === "ArrowLeft" ? -1 : 1);
      return;
    }
    if (e.key !== "Tab") return;
    const items = [...dialog.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return createPortal(
    <div
      className="cm-root"
      onKeyDown={onKeyDown}
      onMouseDown={(e) => { downOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={(e) => { if (e.target === e.currentTarget && downOnBackdrop.current) close(); }}
    >
      <div className="cm-backdrop" ref={backdrop} aria-hidden="true" />
      <div className={"cm-dialog" + (dark ? " cm-dark" : "")} ref={dialog} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <button type="button" className="cm-x" aria-label={closeLabel || "Close"} onClick={() => close()}><CIcon name="close" size={22} strokeWidth={2.2} /></button>
        {typeof children === "function" ? children({ close }) : children}
      </div>
    </div>,
    document.body
  );
}
