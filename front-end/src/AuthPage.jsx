import React, { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiHeart,
  FiLock,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { Auth, api, Notice } from "./shared";
function AuthPage({ signup = false }) {
  const { user, setUser } = useContext(Auth);
  const nav = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [role, setRole] = useState("patient");
  const [show, setShow] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const values = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const d = await api("/auth/" + (signup ? "signup" : "login"), {
        method: "POST",
        body: JSON.stringify({ ...values, role }),
      });
      setUser(d.user);
      nav("/dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-page" id="main">
      <section className="auth-story">
        <span className="eyebrow">A LITTLE MORE CONNECTED</span>
        <h1>
          Your records.
          <br />
          Your space.
          <br />
          <em>Your peace of mind.</em>
        </h1>
        <p>
          A thoughtful home for your medical story, with sharing that puts you
          in control.
        </p>
        <div className="auth-story-bottom">
          <FiShield />
          <span>
            Private records. Deliberate sharing.
            <br />
            Built around patient consent.
          </span>
        </div>
      </section>
      <section className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <span className="eyebrow">
            {signup ? "LET’S GET YOU SET UP" : "GOOD TO SEE YOU AGAIN"}
          </span>
          <h2>{signup ? "Create your account" : "Welcome back."}</h2>
          <p>
            {signup
              ? "Start a more organised health journey."
              : "Sign in to your personal workspace."}
          </p>
          <Notice error>{error}</Notice>
          {signup && (
            <>
              <div
                className="role-switch"
                role="group"
                aria-label="Account type"
              >
                <button
                  type="button"
                  className={role === "patient" ? "selected" : ""}
                  aria-pressed={role === "patient"}
                  onClick={() => setRole("patient")}
                >
                  <FiHeart /> I’m a patient
                </button>
                <button
                  type="button"
                  className={role === "doctor" ? "selected" : ""}
                  aria-pressed={role === "doctor"}
                  onClick={() => setRole("doctor")}
                >
                  <FiUsers /> I’m a doctor
                </button>
              </div>
              <label>
                Full name
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  minLength={2}
                  maxLength={80}
                  required
                />
              </label>
            </>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              maxLength={254}
              required
            />
          </label>
          <label>
            Password
            <span className="password-field">
              <input
                name="password"
                type={show ? "text" : "password"}
                autoComplete={signup ? "new-password" : "current-password"}
                minLength={signup ? 10 : undefined}
                maxLength={128}
                placeholder={
                  signup ? "At least 10 characters" : "Enter your password"
                }
                required
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? "Hide" : "Show"}
              </button>
            </span>
          </label>
          {signup && (
            <label className="checkbox-label">
              <input type="checkbox" required />{" "}
              <span>
                I’ll use synthetic data only and understand this is an{" "}
                <Link to="/privacy">academic prototype</Link>.
              </span>
            </label>
          )}
          <button className="btn full" disabled={busy}>
            {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}{" "}
            {!busy && <FiArrowRight />}
          </button>
          <p className="auth-alternate">
            {signup ? "Already have an account?" : "New to MediConnect?"}{" "}
            <Link to={signup ? "/user-login" : "/registration"}>
              {signup ? "Sign in" : "Create an account"}
            </Link>
          </p>
          {!signup && (
            <small className="muted">
              Password recovery is not available in this showcase. Use a
              memorable test password.
            </small>
          )}
          <div className="form-footnote">
            <FiLock /> Academic showcase · Please use synthetic data.
          </div>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
