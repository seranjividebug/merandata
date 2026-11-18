// Contact form behaviour with mocked server answers (the PHP endpoint itself is not run here).
// Works with or without a Turnstile site key in the build: with a key it waits for the widget's token.
import { launch, BASE } from "./common.mjs";

const b = await launch();
{
  const probe = await b.newPage();
  await probe.goto(BASE + "/", { waitUntil: "load" });
  await probe.waitForTimeout(1500);
  const hasForm = (await probe.locator("#f-name").count()) > 0;
  await probe.close();
  if (!hasForm) {
    console.log("SKIP this build shows the email contact card instead of the form (VITE_CONTACT_FORM_ENABLED is not true). Run npm run qa:contact.");
    await b.close();
    process.exit(0);
  }
}
let fails = 0;
const scenarios = [
  ["server not executing PHP (static host serves the file)", null, "error"],
  ["200 {ok:true}", { status: 200, body: { ok: true } }, "sent"],
  ["200 but not the expected body (never fake success)", { status: 200, body: { hello: 1 } }, "error"],
  ["503 not configured", { status: 503, body: { ok: false, error: "unavailable" } }, "error"],
  ["429 rate limited", { status: 429, body: { ok: false, error: "rate_limited" } }, "limited"],
  ["403 verification failed", { status: 403, body: { ok: false, error: "verification_failed" } }, "error"],
  ["422 field errors", { status: 422, body: { ok: false, error: "validation", errors: { email: "Enter an email in the format name@company.com." } } }, "field"],
  ["network failure", "abort", "error"],
  ["slow 200 (sending state)", { status: 200, body: { ok: true }, delay: 1800 }, "sent"],
];
for (const [label, mock, expect] of scenarios) {
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  let sent = null;
  if (mock) {
    await p.route("**/api/contact.php", async (route) => {
      sent = JSON.parse(route.request().postData() || "{}");
      if (mock === "abort") return route.abort();
      if (mock.delay) await new Promise((r) => setTimeout(r, mock.delay));
      return route.fulfill({ status: mock.status, contentType: "application/json", body: JSON.stringify(mock.body) });
    });
  }
  await p.goto(BASE + "/?interest=qlik#contact", { waitUntil: "load" });
  await p.waitForTimeout(2500);
  await p.fill("#f-name", "Test Person");
  await p.fill("#f-email", "test@example.com");
  await p.fill("#f-company", "Acme");
  await p.fill("#f-msg", "Hello, we want to talk about Qlik Replicate to Snowflake.");
  const hasWidget = (await p.locator(".turnstile").count()) > 0;
  if (hasWidget) await p.waitForFunction(() => { const i = document.querySelector('input[name="cf-turnstile-response"]'); return i && i.value; }, null, { timeout: 15000 }).catch(() => {});
  await p.click('button[type="submit"]');
  let busy = "";
  if (mock && mock.delay) {
    await p.waitForTimeout(300);
    busy = await p.evaluate(() => { const bt = document.querySelector('button[type="submit"]'); return bt ? `disabled=${bt.disabled} spinner=${!!bt.querySelector(".spin")}` : "no button"; });
  }
  await p.waitForTimeout(mock && mock.delay ? 2500 : 1200);
  const out = await p.evaluate(() => ({
    alert: document.querySelector(".alert")?.textContent.trim() || null,
    mailto: document.querySelector(".alert a")?.getAttribute("href") || null,
    success: !!document.querySelector(".success"),
    fieldErr: !!document.querySelector(".err"),
    previewNote: /Preview build/.test(document.body.textContent),
  }));
  const state = out.success ? "sent" : /several requests/.test(out.alert || "") ? "limited" : out.fieldErr && /Please fix/.test(out.alert || "") ? "field" : out.alert ? "error" : "none";
  const good = state === expect && !out.previewNote && (expect !== "error" || out.mailto === "mailto:srivatsans@meridanta.com");
  if (!good) fails++;
  const keys = sent ? Object.keys(sent).join(",") : "(request not intercepted)";
  console.log(`${good ? "PASS" : "FAIL"} ${label.padEnd(56)} -> ${state}${expect === "error" ? " (mailto fallback: " + out.mailto + ")" : ""}${busy ? " while sending: " + busy : ""}  payload: ${keys}${sent ? " interest=" + JSON.stringify(sent.interest) : ""}`);
  await p.close();
}
await b.close();
console.log(`\n${fails} failure(s)`);
process.exit(fails ? 1 : 0);
