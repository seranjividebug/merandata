import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { INTEREST_KEYS, INTERESTS } from "../data";
import { ENQUIRY_EMAIL } from "../company";
import Turnstile, { TURNSTILE_SITE_KEY } from "./Turnstile";
import { I } from "./Icons";
import AnimatedButton from "./AnimatedButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY = { name: "", email: "", company: "", interest: "", message: "", website: "" };

const ENDPOINT = "/api/contact.php";
const TIMEOUT_MS = 20000;

/**
 * Sends the enquiry to the PHP endpoint. Resolves to { ok: true }, or { ok: false, status, errors }.
 * It never reports success unless the server answered 200 with {"ok":true}.
 */
async function sendInquiry(data, turnstileToken) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, turnstileToken, page: window.location.href.split("#")[0] }),
      signal: controller.signal,
    });
    const body = await res.json().catch(() => null);
    if (res.ok && body && body.ok === true) return { ok: true };
    return { ok: false, status: res.status, errors: body && body.errors ? body.errors : null };
  } catch {
    return { ok: false, status: 0, errors: null };
  } finally {
    clearTimeout(timer);
  }
}

function validate(d) {
  const e = {};
  if (!d.name.trim()) e.name = "Enter your name.";
  if (!d.email.trim()) e.email = "Enter your business email.";
  else if (!EMAIL_RE.test(d.email.trim())) e.email = "Enter an email in the format name@company.com.";
  if (!d.message.trim()) e.message = "Tell us briefly about your challenge or initiative.";
  else if (d.message.trim().length < 10) e.message = "Add a little more detail (at least 10 characters).";
  return e;
}

/** The enquiry form. Shown only when the contact form is switched on (see src/contactConfig.js). */
export default function ContactForm() {
  const [v, setV] = useState(EMPTY);
  const { search } = useLocation();
  // /?interest=qlik#contact pre-selects the service, unless the visitor already chose one.
  useEffect(() => {
    const chosen = INTEREST_KEYS[new URLSearchParams(search).get("interest")];
    if (chosen) setV((cur) => (cur.interest ? cur : { ...cur, interest: chosen }));
  }, [search]);
  const [errs, setErrs] = useState({});
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error | limited
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const refs = { name: useRef(), email: useRef(), message: useRef() };

  const set = (k) => (e) => {
    const nv = { ...v, [k]: e.target.value };
    setV(nv);
    if (touched) setErrs(validate(nv));
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const ex = validate(v);
    setErrs(ex);
    const first = ["name", "email", "message"].find((k) => ex[k]);
    if (first) { refs[first].current?.focus(); return; }
    if (TURNSTILE_SITE_KEY && !token) { setErrs({ verify: "Please complete the verification below." }); return; }
    setStatus("sending");
    const res = await sendInquiry(v, token);
    if (res.ok) { setStatus("sent"); return; }
    if (res.status === 422 && res.errors) setErrs(res.errors);
    setToken("");
    setResetKey((k) => k + 1); // a Turnstile token can be used once; ask for a new one
    setStatus(res.status === 429 ? "limited" : "error");
  };

  const fieldErr = (k) => errs[k] && <span className="err" id={k + "-err"}>{I.alert}{errs[k]}</span>;
  const count = Object.keys(errs).length;
  const reset = () => { setV(EMPTY); setErrs({}); setTouched(false); setStatus("idle"); };

  return (
    <div className="form-card">
      {status === "sent" ? (
        <div className="success" role="status">
          <div className="tick">{I.check}</div>
          <h3>Thank you{v.name ? ", " + v.name.trim().split(" ")[0] : ""}.</h3>
          <p>Your inquiry{v.interest ? " about " + v.interest : ""} has been received. Our team will review it and reply to {v.email || "you"}.</p>
          <button className="btn btn-outline" onClick={reset}>Send another inquiry</button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          {touched && count > 0 && (
            <div className="alert" role="alert">Please fix {count} {count === 1 ? "field" : "fields"} highlighted below.</div>
          )}
          {(status === "error" || status === "limited") && (
            <div className="alert" role="alert">
              {status === "limited" ? "You have sent several requests recently. Please try again later" : "Your inquiry couldn’t be sent just now. Please try again in a moment"}
              {" or email us directly at "}<a href={"mailto:" + ENQUIRY_EMAIL}>{ENQUIRY_EMAIL}</a>.
            </div>
          )}
          <div className="grid2">
            <div className="field">
              <label htmlFor="f-name">Name</label>
              <input id="f-name" ref={refs.name} autoComplete="name" value={v.name} onChange={set("name")} aria-required="true" aria-invalid={!!errs.name} aria-describedby={errs.name ? "name-err" : undefined} />
              {fieldErr("name")}
            </div>
            <div className="field">
              <label htmlFor="f-email">Business email</label>
              <input id="f-email" ref={refs.email} type="email" autoComplete="email" value={v.email} onChange={set("email")} aria-required="true" aria-invalid={!!errs.email} aria-describedby={errs.email ? "email-err" : undefined} />
              {fieldErr("email")}
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label htmlFor="f-company">Company <span className="opt">(optional)</span></label>
              <input id="f-company" autoComplete="organization" value={v.company} onChange={set("company")} />
            </div>
            <div className="field">
              <label htmlFor="f-interest">Area of interest <span className="opt">(optional)</span></label>
              <select id="f-interest" value={v.interest} onChange={set("interest")}>
                <option value="">Select an area</option>
                {INTERESTS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="f-msg">Message</label>
            <textarea id="f-msg" ref={refs.message} value={v.message} onChange={set("message")} aria-required="true" aria-invalid={!!errs.message} aria-describedby={errs.message ? "message-err" : undefined} />
            {fieldErr("message")}
          </div>
          <div className="hp" aria-hidden="true">
            <label htmlFor="f-web">Website</label>
            <input id="f-web" tabIndex={-1} autoComplete="off" value={v.website} onChange={set("website")} />
          </div>
          <p className="privacy">
            We use your details only to respond to your inquiry. See our{" "}
            <Link to="/privacy/">privacy policy</Link>.
          </p>
          <Turnstile onToken={(t) => { setToken(t); if (t) setErrs(({ verify, ...rest }) => rest); }} resetKey={resetKey} />
          {errs.verify && <span className="err" role="alert">{I.alert}{errs.verify}</span>}
          <div className="form-foot">
            <AnimatedButton variant="dark" type="submit" disabled={status === "sending"} aria-busy={status === "sending"}>
              {status === "sending" ? <><span className="spin" aria-hidden="true" />Sending…</> : "Send inquiry"}
            </AnimatedButton>
          </div>
        </form>
      )}
    </div>
  );
}
