import React, { useState, useRef } from "react";
import { FiSend } from "react-icons/fi";
import { api, Notice } from "./shared";
export default function Feedback() {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const requestId = useRef(crypto.randomUUID());
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setBusy(true); setError(""); setStatus("");
    try {
      await api("/feedback", {method:"POST",body:JSON.stringify({...values,requestId:requestId.current})});
      setStatus("Thank you! Your feedback has been submitted by email to Kushagra.");
      form.reset(); setMessage(""); requestId.current=crypto.randomUUID();
    } catch(e) { setError(e.message); }
    finally { setBusy(false); }
  }
  return <section className="feedback-section" aria-labelledby="feedback-heading">
    <div className="feedback-card">
      <div><span className="eyebrow">HELP MAKE MEDICONNECT BETTER</span><h2 id="feedback-heading">Share your feedback.</h2>
        <p>Found a rough edge or have an idea? Your message goes directly to Kushagra’s inbox.</p>
        <p>For project feedback only. Please do not include medical records, passwords or other sensitive information.</p>
      </div>
      <form className="feedback-form" onSubmit={submit} aria-busy={busy}>
        <Notice error>{error}</Notice><Notice>{status}</Notice>
        <label htmlFor="feedback-name">Name (optional)<input id="feedback-name" name="name" autoComplete="name" maxLength={80} disabled={busy}/></label>
        <label htmlFor="feedback-email">Email (optional, for a reply)<input id="feedback-email" name="email" type="email" autoComplete="email" maxLength={254} disabled={busy}/></label>
        <label htmlFor="feedback-message">Your feedback<textarea id="feedback-message" name="message" minLength={10} maxLength={2000} value={message} onChange={e=>setMessage(e.target.value)} required disabled={busy}/></label>
        <label className="feedback-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
        <div className="feedback-meta"><span>Sent to kushagrapandey102@gmail.com</span><span>{message.length}/2000</span></div>
        <button className="btn" disabled={busy}>{busy?"Sending…":<>Send feedback <FiSend aria-hidden="true"/></>}</button>
      </form>
    </div>
  </section>;
}
