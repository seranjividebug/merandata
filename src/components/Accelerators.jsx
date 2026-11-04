import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { accelerators } from "../accelerators";
import AcceleratorModal from "./AcceleratorModal";
import { CIcon } from "./caseIcons";

const HASH_PREFIX = "accelerator-";

const setHash = (hash) => {
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, "", pathname + search + hash);
};

/** The accelerator chips (one button each) and the detail dialog they open. Deep link: #accelerator-<id>. */
export default function AcceleratorChips() {
  const [openId, setOpenId] = useState(null);
  const origin = useRef(null);
  const wrap = useRef(null);
  const { hash, key } = useLocation();

  const open = (id, button) => {
    origin.current = button;
    setOpenId(id);
    setHash("#" + HASH_PREFIX + id);
  };

  const select = useCallback((id) => {
    setOpenId(id);
    setHash("#" + HASH_PREFIX + id);
  }, []);

  const refocus = useRef(null);
  const close = useCallback(({ restoreFocus }) => {
    refocus.current = restoreFocus ? openId : null;
    setOpenId(null);
    setHash("");
  }, [openId]);

  // Once the dialog is gone (and the page is no longer inert), return focus to the chip that was open.
  useEffect(() => {
    if (openId !== null || !refocus.current) return;
    const chip = wrap.current?.querySelector(`[data-acc="${refocus.current}"]`);
    refocus.current = null;
    (chip || (origin.current?.isConnected ? origin.current : null))?.focus();
  }, [openId]);

  // Deep link: scroll to the chips and open that tab.
  useEffect(() => {
    if (!hash.startsWith("#" + HASH_PREFIX)) return;
    const id = hash.slice(1 + HASH_PREFIX.length);
    if (!accelerators.some((a) => a.id === id)) return;
    wrap.current?.scrollIntoView({ block: "center" });
    origin.current = null;
    setOpenId(id);
  }, [hash, key]);

  return (
    <>
      <div className="chips" aria-label="Available accelerators" ref={wrap}>
        {accelerators.map((a) => (
          <button key={a.id} type="button" className="chip chip-btn" data-acc={a.id} aria-haspopup="dialog" onClick={(e) => open(a.id, e.currentTarget)}>
            {a.tab}
            <CIcon name="plus" size={14} strokeWidth={2.4} />
          </button>
        ))}
      </div>
      {openId && <AcceleratorModal activeId={openId} origin={origin.current} onSelect={select} onClose={close} />}
    </>
  );
}
