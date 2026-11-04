import { useRef, useState } from "react";
import { INTERESTS } from "../data";
import { I, SectionHead } from "./Icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY = { name: "", email: "", company: "", interest: "", message: "", website: "" };

/**
 * TODO before launch: replace the simulated send in `submit` with the real
 * form endpoint (e.g. Framer form, Formspree, or a Microsoft 365 / Power Automate flow)
 * and confirm the receiving inbox.
 */
async function sendInquiry(data) {
  await new Promise((r) => setTimeout(r, 900));
  return { ok: true };
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

export default function Contact({ onPrivacy }) {
  const [v, setV] = useState(EMPTY);
  const [errs, setErrs] = useState({});
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
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
    if (v.website) { setStatus("sent"); return; } // honeypot: silently ignore bots
    setStatus("sending");
    try {
      const res = await sendInquiry(v);
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  const fieldErr = (k) => errs[k] && <span className="err" id={k + "-err"}>{I.alert}{errs[k]}</span>;
  const count = Object.keys(errs).length;
  const reset = () => { setV(EMPTY); setErrs({}); setTouched(false); setStatus("idle"); };

  return (
    <section id="contact" className="block alt" aria-labelledby="contact-h">
      <div className="wrap">
        <SectionHead id="contact-h" title="Let’s Discuss Your Next Opportunity" intro="Tell us about your business challenge or technology initiative. Our team will review your inquiry and determine how we can help." />
        <div className="contact">
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
                {status === "error" && (
                  <div className="alert" role="alert">Your inquiry couldn’t be sent. Check your connection and try again.</div>
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
                  <button type="button" className="linkbtn" onClick={onPrivacy}>privacy policy</button>.
                </p>
                <div className="form-foot">
                  <button className="btn btn-dark" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send inquiry"}</button>
                  <span className="note">Preview build: messages will be routed to the company inbox before launch.</span>
                </div>
              </form>
            )}
          </div>

          <aside className="loc" aria-labelledby="loc-h">
            <h3 id="loc-h">United States and India</h3>
            <p>Our teams work across both regions, giving customers coverage across time zones.</p>
            <svg viewBox="0 0 360 230" role="img" aria-label="Arc connecting the United States and India" style={{ maxWidth: "420px", alignSelf: "center" }}>
              <defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stopColor="#9B4DA8" /><stop offset="1" stopColor="#EC5FAE" /></linearGradient></defs>
              {[0, 1, 2, 3, 4, 5, 6].map((r) => <line key={"h" + r} x1="0" x2="360" y1={40 + r * 25} y2={40 + r * 25} stroke="rgba(255,255,255,.07)" />)}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => <line key={"v" + c} y1="20" y2="210" x1={20 + c * 40} x2={20 + c * 40} stroke="rgba(255,255,255,.07)" />)}
              <path d="M70 150 Q 180 10 290 150" fill="none" stroke="url(#lg)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M70 150 Q 180 10 290 150" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" pathLength="600" className="flow" />
              {[[70, "United States"], [290, "India"]].map(([x, t]) => (
                <g key={t}>
                  <circle cx={x} cy="150" r="16" fill="rgba(236,95,174,.2)" />
                  <circle cx={x} cy="150" r="7" fill="#fff" />
                  <text x={x} y="186" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="600" fontFamily="inherit">{t}</text>
                </g>
              ))}
            </svg>
          </aside>
        </div>
      </div>
    </section>
  );
}
