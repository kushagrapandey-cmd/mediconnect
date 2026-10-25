import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiHeart, FiShield, FiUsers } from "react-icons/fi";
import { Footer } from "./shared";
function About() {
  return (
    <>
      <main className="container content-page" id="main">
        <span className="eyebrow">THE IDEA BEHIND MEDICONNECT</span>
        <h1>
          Connected records.
          <br />
          <em>Patient-led access.</em>
        </h1>
        <p className="lead">
          Medical information often lives in different folders, inboxes and
          hospitals. MediConnect explores a simpler way for patients to organise
          documents and share them deliberately.
        </p>
        <div className="feature-grid">
          {[
            [
              FiHeart,
              "For patients",
              "A personal record library with categories, search, downloads and a visible activity history.",
            ],
            [
              FiUsers,
              "For doctors",
              "A dedicated workspace to view records from patients who have granted you access.",
            ],
            [
              FiShield,
              "For trust",
              "Hashed passwords, server-side sessions and authorization checks on every document request.",
            ],
          ].map(([Icon, t, p]) => (
            <article className="feature" key={t}>
              <span className="icon-box">
                <Icon />
              </span>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
        <section className="info-panel">
          <h2>What “UHI-inspired” means here</h2>
          <p>
            The project explores connected healthcare workflows. It does not
            integrate with a UHI network, generate an ABHA ID, verify medical
            practitioners, or exchange government health records.
          </p>
          <p>
            Doctor is a self-selected demonstration role. Patient consent is
            still required for access. This is suitable for a software
            demonstration, not for treating patients or storing real medical
            information.
          </p>
        </section>
        <Link className="btn" to="/registration">
          Try the workspace <FiArrowRight />
        </Link>
      </main>
      <Footer />
    </>
  );
}

export default About;
