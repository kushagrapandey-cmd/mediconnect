import React, { createContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiArrowRight,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiFolder,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
const Auth = createContext();
async function api(url, options = {}) {
  const res = await fetch("/api" + url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(
      data.message || "Could not complete the request. Please try again.",
    );
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : res.json();
}
const categories = [
  "Lab report",
  "Prescription",
  "Imaging",
  "Discharge summary",
  "Other",
];
const date = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const initials = (n) =>
  n
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

function Brand() {
  return (
    <Link className="brand" to="/">
      <span className="brand-icon">
        <FiActivity />
      </span>
      Medi<span>Connect</span>
    </Link>
  );
}
function Notice({ children, error = false }) {
  return children ? (
    <div
      className={"notice " + (error ? "error" : "")}
      role={error ? "alert" : "status"}
    >
      {error ? <FiShield /> : <FiCheckCircle />}
      <span>{children}</span>
    </div>
  ) : null;
}
function Footer() {
  return (
    <footer>
      <div>
        <Brand />
        <p>Care is connected. Your records should be, too.</p>
      </div>
      <div>
        <Link to="/about">About the platform</Link>
        <Link to="/contact">Project & team</Link>
        <Link to="/privacy">Privacy & limitations</Link>
      </div>
      <div className="footer-note">
        Built with purpose, by Kushagra & team.
        <br />
        Academic showcase · Use synthetic records only.
      </div>
    </footer>
  );
}
function Modal({ title, children, onClose }) {
  const ref = React.useRef();
  useEffect(() => {
    const prev = document.activeElement;
    ref.current.showModal();
    return () => {
      if (prev?.isConnected) prev.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="dialog-title"
    >
      <div className="modal-header">
        <h2 id="dialog-title">{title}</h2>
        <button
          className="icon-btn"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <FiX />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Records({ records, canDelete, onDelete, onDownload }) {
  const [search, setSearch] = useState(""),
    [cat, setCat] = useState("All records");
  const list = records.filter(
    (r) =>
      (cat === "All records" || r.category === cat) &&
      `${r.title} ${r.filename} ${r.category}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <div className="library-filters">
        <label className="search">
          <FiSearch />
          <input
            aria-label="Search records"
            placeholder="Search your records…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter by category"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          <option>All records</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      {list.length ? (
        <div className="records-table">
          <div className="table-head">
            <span>DOCUMENT</span>
            <span>RECORD DATE</span>
            <span>FILE</span>
            <span>ACTIONS</span>
          </div>
          {list.map((r) => (
            <div className="record-row" key={r.id}>
              <div className="record-title">
                <span className="record-icon">
                  <FiFileText />
                </span>
                <div>
                  <strong>{r.title}</strong>
                  <small>{r.category}</small>
                </div>
              </div>
              <span className="record-date">{date(r.record_date)}</span>
              <span className="file-details">
                {r.mime === "application/pdf"
                  ? "PDF"
                  : r.mime === "image/png"
                    ? "PNG"
                    : "JPG"}{" "}
                <small>{Math.max(1, Math.round(r.size / 1024))} KB</small>
              </span>
              <div className="record-actions">
                <button
                  className="icon-btn"
                  title="Download document"
                  aria-label={"Download " + r.title}
                  onClick={() => onDownload(r)}
                >
                  <FiDownload />
                </button>
                {canDelete && (
                  <button
                    className="icon-btn danger"
                    title="Delete document"
                    aria-label={"Delete " + r.title}
                    onClick={() => onDelete(r)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span className="empty-icon">
            <FiFolder />
          </span>
          <h3>
            {records.length ? "No matching records" : "Your story starts here."}
          </h3>
          <p>
            {records.length
              ? "Try another search or category."
              : canDelete
                ? "Add your first report or prescription to keep it close at hand."
                : "There are no records in this shared library yet."}
          </p>
        </div>
      )}
    </>
  );
}
function PatientList({ patients, onSelect }) {
  return patients.length ? (
    <div>
      {patients.map((p) => (
        <button
          className="patient-row"
          key={p.code}
          onClick={() => onSelect(p.code)}
        >
          <span className="user-avatar">{initials(p.name)}</span>
          <span>
            <strong>{p.name}</strong>
            <small>
              {p.code} · Access until{" "}
              {new Date(p.expires_at).toLocaleString("en-IN")}
            </small>
          </span>
          <FiArrowRight />
        </button>
      ))}
    </div>
  ) : (
    <div className="empty-state">
      <FiUsers />
      <h3>No shared patients yet.</h3>
      <p>
        Give a patient your doctor code. They can grant access from Sharing &
        access.
      </p>
    </div>
  );
}

export {
  Auth,
  api,
  categories,
  date,
  initials,
  Brand,
  Notice,
  Footer,
  Modal,
  Records,
  PatientList,
};
