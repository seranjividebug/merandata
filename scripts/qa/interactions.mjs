// Keyboard, hover, touch and focus behaviour of the interactive parts, in a real browser:
// capability cards (hover preview, Esc, toggle, arrow keys, bottom sheet), Industries cards, search, mobile menu, hero heading,
// floating buttons, and reflected-XSS probes on URL parameters.
//   npm run build && npm run qa:serve   (other window)   npm run qa:interactions
import { launch, BASE } from "./common.mjs";

let fails = 0;
const ok = (c, m) => { if (!c) fails += 1; console.log((c ? "PASS " : "FAIL ") + m); };
const b = await launch();

// ---- capability cards: desktop
{
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  let dialog = false;
  p.on("dialog", (d) => { dialog = true; d.dismiss(); });
  await p.goto(BASE + "/services/data-engineering-analytics/");
  await p.waitForTimeout(700);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, document.querySelector(".rail-sec").getBoundingClientRect().top + scrollY - 90); });
  await p.waitForTimeout(500);
  const open = () => p.locator(".rail-item.is-open").count();
  const card = p.locator(".rail-poster").nth(1);
  const box = await card.boundingBox();
  await p.mouse.move(5, 5);
  await p.mouse.move(box.x + 150, box.y + 60);
  await p.waitForTimeout(800);
  ok((await open()) === 1, "cards: hovering a card opens its preview");
  const pv = await p.evaluate(() => { const e = document.querySelector(".rail-pv.is-panel"); const c = document.querySelectorAll(".rail-poster")[1].getBoundingClientRect(); const r = e.getBoundingClientRect(); return { gap: Math.round(r.top - c.bottom), w: Math.round(r.width - c.width), title: getComputedStyle(e.querySelector(".rail-pv-title")).display, bullets: e.querySelectorAll("li").length }; });
  ok(Math.abs(pv.gap) <= 1 && Math.abs(pv.w) <= 1, `cards: the preview is attached under the card (gap ${pv.gap}px, width difference ${pv.w}px)`);
  ok(pv.title === "none" && pv.bullets === 5, "cards: the preview repeats no title and lists the 5 bullets");
  await p.keyboard.press("Escape");
  await p.waitForTimeout(250);
  ok((await open()) === 0, "cards: Esc closes a preview opened by the mouse");
  await p.mouse.move(5, 5);
  await p.waitForTimeout(200);
  await p.mouse.move(box.x + 150, box.y + 60);
  await p.waitForTimeout(800);
  await p.locator(".rail-go").nth(1).click();
  await p.waitForTimeout(250);
  ok((await open()) === 0 && (await p.getAttribute(".rail-go >> nth=1", "aria-expanded")) === "false", "cards: activating the arrow of an open card closes it (aria-expanded false)");
  await p.mouse.move(5, 5);
  await p.locator(".rail-go").first().focus();
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.activeElement === document.querySelectorAll(".rail-go")[1]), "cards: ArrowRight moves focus to the next card");
  await p.keyboard.press("Tab");
  ok(await p.evaluate(() => document.activeElement.classList.contains("rail-chip")), "cards: Tab from an open card reaches its Discuss link");
  ok(await p.evaluate(() => document.querySelectorAll(".rail-item h3").length === 6), "cards: one heading per card");
  ok(await p.evaluate(() => document.querySelectorAll(".rail-pv:not(.is-panel) .rail-chip[tabindex='-1']").length === 5), "cards: the links of closed previews are out of the tab order");
  ok(!dialog, "cards: no script dialogs");
  await p.close();
}

// ---- capability cards: phone bottom sheet
{
  const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await m.goto(BASE + "/services/consulting-delivery/");
  await m.waitForTimeout(700);
  await m.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, document.querySelector(".rail-sec").getBoundingClientRect().top + scrollY - 90); });
  await m.waitForTimeout(500);
  await m.locator(".rail-go").nth(2).tap();
  await m.waitForTimeout(600);
  ok(await m.evaluate(() => !!document.querySelector('[role="dialog"].is-sheet') && document.activeElement.classList.contains("rail-x")), "sheet: tap opens a dialog and focus goes to its close button");
  ok(await m.evaluate(() => getComputedStyle(document.querySelector(".fab")).display === "none"), "sheet: the floating buttons are hidden while it is open");
  ok(await m.evaluate(() => getComputedStyle(document.querySelector("header.header")).zIndex === "0"), "sheet: the page header is below the dimmed backdrop while it is open");
  await m.keyboard.press("Tab");
  await m.keyboard.press("Tab");
  await m.keyboard.press("Tab");
  ok(await m.evaluate(() => !!document.activeElement.closest(".is-sheet")), "sheet: Tab stays inside the sheet");
  await m.keyboard.press("Escape");
  await m.waitForTimeout(300);
  ok(await m.evaluate(() => !document.querySelector('[role="dialog"]') && document.activeElement === document.querySelectorAll(".rail-go")[2]), "sheet: Esc closes it and focus returns to the card button");
  await m.close();
}

// ---- Industries cards (desktop): collapsed card links leave the tab order
{
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto(BASE + "/");
  await p.waitForTimeout(900);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; document.querySelector("#industries").scrollIntoView(); });
  await p.waitForTimeout(700);
  const bx = await p.locator(".ic-card").first().boundingBox();
  await p.mouse.move(bx.x + 40, bx.y + 40);
  await p.waitForTimeout(900);
  const st = await p.evaluate(() => [...document.querySelectorAll(".ic-card")].map((c) => c.classList.contains("is-collapsed") + ":" + getComputedStyle(c.querySelector(".ic-actions")).visibility));
  ok(st[0] === "false:visible" && st[1] === "true:hidden", `industries: the collapsed card's links are hidden (${st.join(" ")})`);

  // hero: one h1 that stays in the accessibility tree while another banner shows
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.locator(".hs-dot").nth(2).click();
  await p.mouse.move(700, 900);
  await p.waitForTimeout(1200);
  ok(await p.evaluate(() => { const h = document.querySelector("h1"); return !!h && !h.closest("[aria-hidden='true']") && document.querySelectorAll("h1").length === 1; }), "hero: the page's h1 is still available while banner 3 is showing");

  // search closes on Tab away
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.locator('button[aria-label*="earch"]').first().click();
  await p.waitForTimeout(300);
  await p.fill('input[role="combobox"]', "qlik");
  await p.waitForTimeout(250);
  const exp = await p.getAttribute('input[role="combobox"]', "aria-expanded");
  await p.keyboard.press("Tab");
  await p.keyboard.press("Tab");
  await p.waitForTimeout(300);
  ok(exp === "true" && (await p.locator('input[role="combobox"]').count()) === 0, "search: aria-expanded is true with results; Tab away closes the panel");
  await p.close();
}

// ---- mobile menu: Esc returns focus
{
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(BASE + "/");
  await m.waitForTimeout(700);
  await m.locator(".menu-btn").click();
  await m.waitForTimeout(300);
  await m.keyboard.press("Escape");
  await m.waitForTimeout(250);
  ok(await m.evaluate(() => document.activeElement?.classList.contains("menu-btn")), "mobile menu: Esc closes it and focus returns to the menu button");
  await m.close();
}

// ---- back to top keeps focus on a real element
{
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + "/services/ai-solutions/");
  await p.waitForTimeout(700);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, 1500); });
  await p.waitForTimeout(500);
  await p.locator(".fab-top").focus();
  await p.keyboard.press("Enter");
  await p.waitForTimeout(1500);
  ok(await p.evaluate(() => document.activeElement && document.activeElement !== document.body && scrollY < 60), "back to top: scrolls up and focus lands on the page content, not on nothing");
  await p.close();
}

// ---- reflected XSS probes
{
  const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
  let dialog = false;
  p.on("dialog", (d) => { dialog = true; d.dismiss(); });
  for (const u of ["/contact/?interest=%3Cimg%20src=x%20onerror=alert(1)%3E", "/?interest=__proto__#contact", "/%3Cscript%3Ealert(1)%3C/script%3E/", "/services/data-engineering-analytics/?q=%22%3E%3Cscript%3Ealert(1)%3C/script%3E"]) {
    await p.goto(BASE + u);
    await p.waitForTimeout(500);
    const injected = await p.evaluate(() => document.body.innerHTML.includes("onerror=alert") || [...document.scripts].some((s) => !s.src && s.textContent.includes("alert(1)")));
    ok(!dialog && !injected, "xss probe " + u.slice(0, 70));
  }
  await p.close();
}

await b.close();
console.log(`\n${fails} failure(s)`);
process.exit(fails ? 1 : 0);
