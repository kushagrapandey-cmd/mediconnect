import React from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiCheck,
  FiCheckCircle,
  FiFileText,
  FiFolder,
  FiHeart,
  FiLock,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { Footer } from "./shared";
function Home() {
  return (
    <>
      <main id="main">
        <section className="hero container">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="dot" /> YOUR HEALTH. ONE CONNECTED SPACE.
            </div>
            <h1>
              A little less paperwork.
              <br />
              <em>A lot more peace of mind.</em>
            </h1>
            <p>
              Keep your medical story together. Organise your records, find what
              you need, and share them with your doctor — on your terms.
            </p>
            <div className="button-row">
              <Link className="btn" to="/registration">
                Create your health space <FiArrowRight />
              </Link>
              <Link className="btn secondary" to="/about">
                See how it works
              </Link>
            </div>
            <div className="hero-benefits">
              <span>
                <FiCheck /> Patient-controlled sharing
              </span>
              <span>
                <FiCheck /> All your records together
              </span>
            </div>
          </div>
          <div
            className="hero-art"
            aria-label="Illustration of an organised personal health workspace"
          >
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="floating-plus">+</span>
            <div className="mini-card shield-card">
              <span className="icon-box">
                <FiShield />
              </span>
              <div>
                <strong>Your records, your choice</strong>
                <small>You decide who gets access.</small>
              </div>
              <span className="verified">
                <FiCheck />
              </span>
            </div>
            <div className="health-card">
              <div className="card-top">
                <span className="icon-box mint">
                  <FiHeart />
                </span>
                <span className="pill">PERSONAL HEALTH SPACE</span>
              </div>
              <h3>Everything in its place.</h3>
              <p>A clearer picture of your health.</p>
              <div className="pulse">
                <svg viewBox="0 0 280 70" aria-hidden="true">
                  <path d="M0 40H50L65 28L78 48L96 9L116 60L136 31L150 40H280" />
                </svg>
              </div>
              {[
                ["Lab reports", "Keep the details together"],
                ["Prescriptions", "Ready for your next visit"],
                ["Shared access", "Only with your permission"],
              ].map(([a, b], i) => (
                <div className="sample-record" key={a}>
                  <span className={"record-icon r" + i}>
                    {i === 2 ? <FiUsers /> : <FiFileText />}
                  </span>
                  <div>
                    <strong>{a}</strong>
                    <small>{b}</small>
                  </div>
                  <FiCheckCircle />
                </div>
              ))}
            </div>
            <div className="mini-card bottom-card">
              <span className="icon-box peach">
                <FiFolder />
              </span>
              <div>
                <strong>One place. Less searching.</strong>
                <small>From your first visit to your latest report.</small>
              </div>
            </div>
            <span className="art-caption">
              AN ILLUSTRATION OF A SIMPLER HEALTH JOURNEY
            </span>
          </div>
        </section>
        <div className="trust-strip">
          <span>Designed around you</span>
          <div>
            <FiLock /> Private by default
          </div>
          <div>
            <FiUsers /> Consent comes first
          </div>
          <div>
            <FiFileText /> Records made simple
          </div>
        </div>
        <section className="section container">
          <div className="section-title">
            <div>
              <span className="eyebrow">
                LESS FRICTION, BETTER ORGANISATION
              </span>
              <h2>
                Your health story.
                <br />
                Without the scattered pages.
              </h2>
            </div>
            <p>
              A thoughtful workspace for patients and doctors, built around a
              simple idea: the patient stays in control.
            </p>
          </div>
          <div className="feature-grid">
            {[
              [
                FiFolder,
                "01",
                "A home for every record",
                "Upload reports, prescriptions and scans. Add a date and category so the right document is always easy to find.",
              ],
              [
                FiShield,
                "02",
                "Share with confidence",
                "Give a specific doctor read access for 24 hours. Revoke permission whenever you choose.",
              ],
              [
                FiActivity,
                "03",
                "Know what happened",
                "An activity timeline helps you see uploads, sharing changes, and doctor access to your records.",
              ],
            ].map(([Icon, n, t, p]) => (
              <article className="feature" key={n}>
                <div>
                  <span className="icon-box">
                    <Icon />
                  </span>
                  <span className="feature-number">{n}</span>
                </div>
                <h3>{t}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="container steps-section">
          <div>
            <span className="eyebrow">A SIMPLE START</span>
            <h2>
              Ready for your
              <br />
              next appointment.
            </h2>
            <Link className="text-link" to="/registration">
              Start organising <FiArrowRight />
            </Link>
          </div>
          <ol>
            {[
              ["Create your account", "Choose a patient or doctor workspace."],
              [
                "Bring your records together",
                "Upload a PDF, JPEG or PNG, up to 2 MB each.",
              ],
              [
                "Connect with your doctor",
                "Use their doctor code to grant time-limited access.",
              ],
            ].map(([t, p], i) => (
              <li key={t}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="cta container">
          <FiHeart />
          <span className="eyebrow">MORE TIME FOR WHAT MATTERS</span>
          <h2>Make room for simpler care.</h2>
          <p>Start with one record. Build a more organised health story.</p>
          <Link className="btn light" to="/registration">
            Get started <FiArrowRight />
          </Link>
        </section>
        <div className="disclaimer container">
          <FiShield /> MediConnect is an academic prototype, not a clinical
          service. It is UHI-inspired and is not connected to ABDM or government
          health systems. Please use synthetic data.
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Home;
