import React from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { Footer } from "./shared";
function Privacy() {
  return (
    <>
      <main className="container content-page narrow" id="main">
        <span className="eyebrow">CLEAR EXPECTATIONS</span>
        <h1>Privacy & limitations.</h1>
        <div className="info-panel">
          <h2>A showcase, not a clinical system</h2>
          <p>
            Use invented names and synthetic documents. Do not upload real
            patient records, identity documents, or emergency information.
          </p>
          <h3>What is stored</h3>
          <p>
            Your account name, email, hashed password, role, record files and
            metadata, sharing permissions, and a record access timeline are
            stored in a project-specific PostgreSQL database on Neon. Session
            cookies are HttpOnly and expire after seven days. Vercel hosts the
            application.
          </p>
          <h3>How sharing works</h3>
          <p>
            Records are private to their owner by default. A patient can grant a
            specific doctor access to selected documents for 1 hour to 7 days.
            New uploads remain private. Legacy whole-library permissions remain
            labelled until expiry or revocation. Revoking access blocks future requests; it
            cannot recall a downloaded copy.
          </p>
          <h3>Practical limits</h3>
          <p>
            Up to 30 documents per patient; PDF, JPEG or PNG files up to 2 MB
            each. Doctor registration is not independently verified. Email
            delivery is not configured; password recovery is available with a saved
            recovery key. Clinical validation, regulatory certification and
            government interoperability are not implemented.
          </p>
          <h3>Deleting a record</h3>
          <p>
            You can delete your own documents from the library. The content is
            removed from the active database; an activity entry remains. Hosting
            providers may retain backups under their policies. For account
            removal or questions, contact the project maintainer.
          </p>
          <a className="text-link" href="mailto:kushagrapandey102@gmail.com">
            Contact the maintainer <FiArrowUpRight />
          </a>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Privacy;
