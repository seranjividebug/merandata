import { useCallback, useEffect, useRef, useState } from "react";
import { HERO_SLIDES } from "../data";
import { useSectionLink } from "../nav";
import { REDUCED } from "../utils";
import qlikImg from "../assets/hero/hero-qlik.webp";
import aiImg from "../assets/hero/hero-ai.webp";
import healthcareImg from "../assets/hero/hero-healthcare.webp";
import QlikLogo from "./QlikLogo";
import AnimatedButton from "./AnimatedButton";

const IMAGES = { qlik: qlikImg, ai: aiImg, healthcare: healthcareImg };
const INTERVAL = 6000;
const SWIPE_PX = 50;

// Preload the first slide's image so the hero paints without waiting on the React tree.
if (typeof document !== "undefined" && !document.querySelector("link[data-hero-preload]")) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = IMAGES.qlik;
  link.dataset.heroPreload = "";
  document.head.appendChild(link);
}

const Arrow = ({ dir }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const touchX = useRef(null);
  const sectionLink = useSectionLink();
  const count = HERO_SLIDES.length;
  const playing = !REDUCED && !paused && !userPaused;

  const goTo = useCallback((i) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (!playing) return undefined;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearTimeout(t);
  }, [playing, index, count]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
  };
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) >= SWIPE_PX) goTo(index + (dx < 0 ? 1 : -1));
  };
  const onBlur = (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); };

  return (
    <section
      id="home"
      data-hero
      className="hs"
      aria-roledescription="carousel"
      aria-label="Featured highlights"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={onBlur}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hs-track" aria-live={playing ? "off" : "polite"}>
        {HERO_SLIDES.map((s, i) => {
          const active = i === index;
          const Title = i === 0 ? "h1" : "h2";
          const link = s.to ? null : sectionLink(s.section);
          const label = <>Explore More<span className="sr">: {s.title}</span></>;
          return (
            <div
              key={s.key}
              className={"hs-slide" + (active ? " is-active" : "")}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              inert={active ? undefined : ""}
            >
              <img
                className="hs-img"
                src={IMAGES[s.key]}
                alt={s.alt}
                width="1920"
                height="900"
                decoding="async"
                {...(i === 0 ? { fetchpriority: "high" } : { loading: "lazy" })}
              />
              <div className="hs-shade" aria-hidden="true" />
              <div className="wrap hs-copy">
                <div className="hs-l">
                  {s.eyebrow && <p className="hs-eyebrow">{s.eyebrow}</p>}
                  <Title className="hs-title">
                    {s.titleLines
                      ? <><span className="hs-t1">{s.logo ? <QlikLogo className="hs-logo" /> : s.titleLines[0]}</span>{" "}<span className="hs-t2">{s.titleLines[1]}</span></>
                      : s.title}
                  </Title>
                </div>
                <div className="hs-r">
                  <p className="hs-desc">{s.desc}</p>
                  {s.to
                    ? <AnimatedButton shine className="hs-btn" to={s.to} tabIndex={active ? 0 : -1}>{label}</AnimatedButton>
                    : <AnimatedButton shine className="hs-btn" {...link} tabIndex={active ? 0 : -1}>{label}</AnimatedButton>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button type="button" className="hs-arrow hs-prev" aria-label="Previous slide" onClick={() => goTo(index - 1)}><Arrow dir="prev" /></button>
      <button type="button" className="hs-arrow hs-next" aria-label="Next slide" onClick={() => goTo(index + 1)}><Arrow dir="next" /></button>

      <div className="hs-bar">
        <div className="hs-dots" role="group" aria-label="Choose slide">
          {HERO_SLIDES.map((s, i) => (
            <button key={s.key} type="button" className={"hs-dot" + (i === index ? " is-on" : "")}
              aria-label={`Go to slide ${i + 1}: ${s.title}`} aria-current={i === index ? "true" : undefined} onClick={() => goTo(i)} />
          ))}
        </div>
        {!REDUCED && (
          <button type="button" className="hs-pp" aria-label={userPaused ? "Play slideshow" : "Pause slideshow"} onClick={() => setUserPaused((v) => !v)}>
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor">
              {userPaused ? <path d="M7 4.5v15l13-7.5z" /> : <path d="M6 4h4v16H6zM14 4h4v16h-4z" />}
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
