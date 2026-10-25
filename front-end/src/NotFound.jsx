import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
function NotFound() {
  return (
    <main className="container content-page" id="main">
      <span className="eyebrow">404 · A SMALL DETOUR</span>
      <h1>This page isn’t here.</h1>
      <p className="lead">Let’s get you back to your connected health space.</p>
      <Link className="btn" to="/">
        Back home <FiArrowRight />
      </Link>
    </main>
  );
}

export default NotFound;
