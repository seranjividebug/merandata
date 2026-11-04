import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { searchSite } from "../searchIndex";
import { go, REDUCED } from "../utils";
import { I } from "./Icons";

/** Header search: an icon button that opens a results panel; results link to pages and sections. */
export default function Search({ onOpen }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const wrap = useRef(null);
  const input = useRef(null);
  const button = useRef(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const panelId = useId();
  const results = searchSite(query);

  const close = (refocus) => {
    setOpen(false);
    setQuery("");
    setActive(0);
    if (refocus) button.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    input.current?.focus();
    const away = (e) => { if (wrap.current && !wrap.current.contains(e.target)) close(false); };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
  }, [open]);

  const choose = (entry) => {
    close(false);
    if (entry.path === pathname) {
      if (entry.hash) go(entry.hash);
      else window.scrollTo({ top: 0, behavior: REDUCED ? "auto" : "smooth" });
      return;
    }
    navigate({ pathname: entry.path, hash: entry.hash ? "#" + entry.hash : "" });
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") { e.preventDefault(); close(true); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[active]) { e.preventDefault(); choose(results[active]); }
  };

  const optionId = (i) => `${panelId}-o${i}`;
  return (
    <div className="search" ref={wrap}>
      <button
        ref={button}
        type="button"
        className="search-btn"
        aria-label="Search"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => { if (!open && onOpen) onOpen(); setOpen(!open); }}
      >
        {I.search}
      </button>
      {open && (
        <div className="search-panel" id={panelId} role="search">
          <div className="search-field">
            {I.search}
            <input
              ref={input}
              type="search"
              placeholder="Search services, industries, Qlik…"
              aria-label="Search the site"
              role="combobox"
              aria-expanded="true"
              aria-controls={panelId + "-list"}
              aria-activedescendant={results[active] ? optionId(active) : undefined}
              autoComplete="off"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActive(0); }}
              onKeyDown={onKeyDown}
            />
          </div>
          {query.trim() && (
            results.length ? (
              <ul className="search-list" id={panelId + "-list"} role="listbox" aria-label="Search results">
                {results.map((r, i) => (
                  <li
                    key={r.group + r.title}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === active}
                    className={i === active ? "is-active" : undefined}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(r)}
                  >
                    <span className="sr-t">{r.title}</span>
                    <span className="sr-g">{r.group}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="search-empty" role="status">No results for “{query.trim()}”.</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
