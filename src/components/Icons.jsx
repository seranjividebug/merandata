const line = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };

export const I = {
  compass: <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>,
  spark: <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><path d="M12 3v3M12 18v3M3 12h3M18 12h3" /><path d="M12 7.5l1.4 3.1 3.1 1.4-3.1 1.4L12 16.5l-1.4-3.1L7.5 12l3.1-1.4z" /></svg>,
  db: <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><ellipse cx="12" cy="5.5" rx="7" ry="2.5" /><path d="M5 5.5v6.5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5.5" /><path d="M5 12v6.5C5 19.9 8.1 21 12 21s7-1.1 7-2.5V12" /></svg>,
  chart: <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><path d="M4 20h16" /><rect x="5.5" y="11" width="3" height="6" rx="1" /><rect x="10.5" y="7" width="3" height="10" rx="1" /><rect x="15.5" y="4" width="3" height="13" rx="1" /></svg>,
  bi: <svg width="30" height="30" viewBox="0 0 24 24" strokeWidth="1.6" {...line}><rect x="3" y="4" width="18" height="13" rx="2.5" /><path d="M8 21h8M12 17v4" /><path d="M7 13.5l3-3 2.5 2 4-4.5" /></svg>,
  ai: <svg width="30" height="30" viewBox="0 0 24 24" strokeWidth="1.6" {...line}><path d="M12 5v14" /><path d="M12 5a3 3 0 0 0-5.5 1.5A3.2 3.2 0 0 0 4.5 12a3.2 3.2 0 0 0 2 3A3 3 0 0 0 12 19" /><path d="M12 5a3 3 0 0 1 5.5 1.5A3.2 3.2 0 0 1 19.5 12a3.2 3.2 0 0 1-2 3A3 3 0 0 1 12 19" /><path d="M12 9.5H9M12 14h3" /><circle cx="8.3" cy="9.5" r=".8" fill="currentColor" /><circle cx="15.7" cy="14" r=".8" fill="currentColor" /></svg>,
  health: <svg width="30" height="30" viewBox="0 0 24 24" strokeWidth="1.6" {...line}><path d="M12 20.5s-8-4.7-8-10.6A4.6 4.6 0 0 1 12 7.2a4.6 4.6 0 0 1 8 2.7c0 5.9-8 10.6-8 10.6z" /><path d="M6.5 12.5h3l1.5-2.5 2 4.5 1.5-2h3" /></svg>,
  replicate: <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><path d="M4 8h13l-3-3M20 16H7l3 3" /><ellipse cx="6" cy="12" rx="2" ry="1" /><ellipse cx="18" cy="12" rx="2" ry="1" /></svg>,
  etl: <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><rect x="3" y="9" width="5" height="6" rx="1.2" /><rect x="16" y="9" width="5" height="6" rx="1.2" /><circle cx="12" cy="12" r="2.2" /><path d="M8 12h1.8M14.2 12H16" /></svg>,
  quality: <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><path d="M12 3l7 2.8v5.5c0 4.3-3 7.6-7 9.2-4-1.6-7-4.9-7-9.2V5.8z" /><path d="M8.8 12l2.2 2.2 4.2-4.400" /></svg>,
  lakehouse: <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><path d="M12 3l9 4.5-9 4.5-9-4.5z" /><path d="M3 12l9 4.5 9-4.5M3 16.5L12 21l9-4.5" /></svg>,
  dashboard: <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><rect x="3" y="4" width="18" height="16" rx="2.5" /><path d="M7 16v-3M11 16V9M15 16v-5" /><path d="M7 8h2" /></svg>,
  report: <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 15.5h5M10 9h2" /></svg>,
  automation: <svg width="26" height="26" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><path d="M13 3L5 13.5h6L10 21l8-10.5h-6z" /></svg>,
  go: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  chev: <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  check: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  alert: <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.6" /><path d="M8 4.5v4.2M8 11v.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  challenge: <svg width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.8" {...line}><path d="M12 3l9 16H3z" /><path d="M12 10v4M12 17v.2" /></svg>,
  opportunity: <svg width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.8" {...line}><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z" /></svg>,
  capability: <svg width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.8" {...line}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>,
  people: <svg width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" /><path d="M15.5 5.2a3 3 0 0 1 0 5.6M17.5 14.6c1.6.6 2.7 2.1 3 4.4" /></svg>,
  gear: <svg width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><path d="M8 9l-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12" /></svg>,
  target: <svg width="22" height="22" viewBox="0 0 24 24" strokeWidth="1.7" {...line}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r=".8" fill="currentColor" /></svg>,
  pause: <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor" /><rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor" /></svg>,
  play: <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2.5v9l7.5-4.5z" fill="currentColor" /></svg>,
  prev: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  next: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  menu: <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
  close: <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M5 5l12 12M17 5L5 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>,
};

export function SectionHead({ id, title, intro }) {
  return (
    <div className="head">
      <div className="rule" />
      <h2 id={id}>{title}</h2>
      {intro && <p>{intro}</p>}
    </div>
  );
}
