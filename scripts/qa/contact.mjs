// Contact section with the form switched OFF (the default): an email card, no form, correct mailto, no console errors.
// With the form switched on, run `npm run qa:form` instead.
import { launch, BASE, watch } from "./common.mjs";

const b = await launch();
let fails = 0;
const ok = (c, msg) => { if (!c) fails++; console.log((c ? "PASS " : "FAIL ") + msg); };
const MAILTO = "mailto:srivatsans@meridanta.com?subject=Website%20enquiry";

for (const [w, h] of [[1440, 900], [768, 1024], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const issues = watch(p);
  await p.goto(BASE + "/#contact", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  const card = p.locator("#contact .contact-card");
  const info = await p.evaluate(() => {
    const s = document.getElementById("contact");
    const c = s.querySelector(".contact-card");
    return {
      heading: s.querySelector("h2")?.textContent,
      intro: s.querySelector(".head p")?.textContent,
      forms: s.querySelectorAll("form, input, textarea, select").length,
      turnstile: document.querySelectorAll(".turnstile, iframe[src*='challenges.cloudflare.com']").length,
      title: c?.querySelector("h3")?.textContent,
      mailLinks: [...(c?.querySelectorAll("a[href^='mailto:']") ?? [])].map((a) => a.getAttribute("href")),
      buttonText: c?.querySelector("a.abtn")?.textContent.trim(),
      office: c?.querySelector(".contact-office")?.textContent.replace(/\s+/g, " ").trim(),
      top: Math.round(s.getBoundingClientRect().top),
      hscroll: document.documentElement.scrollWidth - innerWidth,
      cardBox: c ? [Math.round(c.getBoundingClientRect().width), Math.round(c.getBoundingClientRect().height)] : null,
    };
  });
  ok((await card.count()) === 1 && (await card.isVisible()), `${w}px  contact card is visible`);
  ok(info.forms === 0 && info.turnstile === 0, `${w}px  no form fields and no Turnstile on the page (form elements: ${info.forms})`);
  ok(info.title === "Email us at srivatsans@meridanta.com", `${w}px  card heading: "${info.title}"`);
  ok(info.mailLinks.length === 2 && info.mailLinks.every((l) => l === MAILTO) && info.buttonText === "Send us an email", `${w}px  mailto links: ${info.mailLinks.join(" , ")}  button: "${info.buttonText}"`);
  ok(info.office === "Registered Office: 262 Chapman Rd, Ste 240, Newark, DE 19702, USA", `${w}px  registered office line: "${info.office}"`);
  ok(info.heading === "Let’s Discuss Your Next Opportunity" && /^Tell us about your business challenge/.test(info.intro), `${w}px  section heading and intro unchanged`);
  ok(info.hscroll <= 0 && info.top >= 0 && info.top <= 140, `${w}px  no horizontal scroll; section top ${info.top}px after #contact; card ${info.cardBox?.join("x")}px`);
  ok(issues.length === 0, `${w}px  no console messages ${issues.join(" | ")}`);
  if (w === 1440 || w === 390) await p.screenshot({ path: (process.env.SHOTS || ".") + `/contact_card_${w}.png` });
  await p.close();
}

// Every call to action still reaches the contact section.
for (const [start, label, loc] of [
  ["/qlik/", "Qlik hero button", (p) => p.locator("a.hero-btn", { hasText: "Talk to a Qlik Expert" })],
  ["/industries/healthcare/", "Healthcare hero button", (p) => p.locator(".qhero-ctas a", { hasText: "Talk to Our Team" })],
  ["/", "header Get in Touch", (p) => p.locator("header a.cta-head")],
]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const issues = watch(p);
  await p.goto(BASE + start, { waitUntil: "load" });
  await p.waitForTimeout(2200);
  await loc(p).first().click();
  await p.waitForTimeout(2500);
  const top = await p.evaluate(() => Math.round(document.getElementById("contact").getBoundingClientRect().top));
  const visible = await p.locator("#contact .contact-card").isVisible();
  ok(visible && top >= -60 && top <= 150 && issues.length === 0, `CTA "${label}" from ${start} lands on the contact card (section top ${top}px)${issues.length ? " " + issues.join("|") : ""}`);
  await p.close();
}
await b.close();
console.log(`\n${fails} failure(s)`);
process.exit(fails ? 1 : 0);
