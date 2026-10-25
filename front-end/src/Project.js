import React from "react";
import { FiArrowUpRight } from "react-icons/fi";
import { Footer } from "./shared";
function Project() {
  const team = [
    ["Kushagra Pandey", "Development", "kpimg.png"],
    ["Arun Kumar Shukla", "Database", "arun.png"],
    ["Prajjwal Kumar", "Interface design", "prajjwal.png"],
    ["Prince Kumar Pal", "Backend", "prince.png"],
  ];
  return (
    <>
      <main className="container content-page" id="main">
        <span className="eyebrow">ENGINEERING WITH A PURPOSE</span>
        <h1>
          A project about
          <br />
          <em>making care connect.</em>
        </h1>
        <p className="lead">
          An academic healthcare record platform exploring full-stack
          development, access control, and the practical challenges of handling
          sensitive documents.
        </p>
        <div className="section-title">
          <div>
            <span className="eyebrow">THE PEOPLE BEHIND IT</span>
            <h2>Meet the team.</h2>
          </div>
        </div>
        <div className="team-grid">
          {team.map(([n, r, img]) => (
            <article className="team-card" key={n}>
              <img
                src={"/assets/team/" + img}
                alt={n}
                width="100"
                height="100"
                loading="lazy"
              />
              <h3>{n}</h3>
              <p>{r}</p>
            </article>
          ))}
        </div>
        <div className="info-panel">
          <h2>Explore the engineering</h2>
          <p>
            React interface → Express API → PostgreSQL. Server-side sessions
            protect accounts; explicit, expiring grants protect shared records.
            Uploads are validated and downloaded by record ID rather than
            filename.
          </p>
          <div className="button-row">
            <a
              className="btn"
              href="https://github.com/kushagrapandey-cmd/mediconnect"
              target="_blank"
              rel="noreferrer"
            >
              View source code <FiArrowUpRight />
            </a>
            <a
              className="btn secondary"
              href="mailto:kushagrapandey102@gmail.com"
            >
              Contact Kushagra
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Project;
