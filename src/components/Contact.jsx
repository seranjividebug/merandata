import { useRef, useState } from "react";
import { INTERESTS } from "../data";
import { I, SectionHead } from "./Icons";
import AnimatedButton from "./AnimatedButton";
import locImg from "../assets/loc-qlik.webp";

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
                  <AnimatedButton variant="dark" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send inquiry"}</AnimatedButton>
                  <span className="note">Preview build: messages will be routed to the company inbox before launch.</span>
                </div>
              </form>
            )}
          </div>

          <aside className="loc" aria-label="Qlik Analytics and Integration">
            <img className="loc-img" src={locImg} width="971" height="1188" alt="Qlik Analytics and Integration: end-to-end data integration, analytics, and operational insights with Qlik, shown as a dashboard with data sources, insights found and replication health" loading="lazy" decoding="async" />
          </aside>
        </div>
      </div>
    </section>
  );
}
