import React, { useContext, useEffect, useState, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiClock,
  FiFolder,
  FiGrid,
  FiHeart,
  FiLock,
  FiLogOut,
  FiPlus,
  FiSearch,
  FiShield,
  FiUsers,
  FiX,
  FiCopy,
} from "react-icons/fi";
import {
  Auth,
  api,
  initials,
  Notice,
  Modal,
  Records,
  PatientList,
} from "./shared";
import UploadModal from "./UploadModal";
function Dashboard() {
  const { user, loading, logout } = useContext(Auth);
  const [tab, setTab] = useState("overview");
  const [records, setRecords] = useState([]),
    [grants, setGrants] = useState([]),
    [activity, setActivity] = useState([]),
    [patients, setPatients] = useState([]),
    [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [upload, setUpload] = useState(false),
    [deleting, setDeleting] = useState(null),
    [actionBusy, setActionBusy] = useState(false);
  const patient = user?.role === "patient";
  const refresh = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    setError("");
    try {
      if (user.role === "patient") {
        const [r, g, a] = await Promise.all([
          api("/records"),
          api("/grants"),
          api("/activity"),
        ]);
        setRecords(r.records);
        setGrants(g.grants);
        setActivity(a.activity);
      } else {
        const d = await api("/patients");
        setPatients(d.patients);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [user]);
  useEffect(() => {
    refresh();
  }, [refresh]);
  if (loading)
    return <main className="loading-state">Opening your workspace…</main>;
  if (!user) return <Navigate to="/user-login" replace />;
  async function download(r) {
    setError("");
    try {
      const res = await fetch("/api/records/" + r.id + "/download");
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message);
      }
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = r.filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (patient) {
        const d = await api("/activity");
        setActivity(d.activity);
      }
    } catch (e) {
      setError(e.message);
    }
  }
  async function remove() {
    setActionBusy(true);
    try {
      await api("/records/" + deleting.id, { method: "DELETE" });
      setDeleting(null);
      setMessage("Document deleted.");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionBusy(false);
    }
  }
  async function share(e) {
    e.preventDefault();
    const f = e.currentTarget;
    setActionBusy(true);
    setError("");
    try {
      await api("/grants", {
        method: "POST",
        body: JSON.stringify({ code: new FormData(f).get("code") }),
      });
      f.reset();
      setMessage("Doctor access granted for 24 hours.");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionBusy(false);
    }
  }
  async function revoke(code) {
    setActionBusy(true);
    try {
      await api("/grants/" + code, { method: "DELETE" });
      setMessage("Doctor access revoked.");
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionBusy(false);
    }
  }
  async function lookup(code) {
    setError("");
    setBusy(true);
    try {
      const d = await api(
        "/patients/" +
          encodeURIComponent(code.trim().toUpperCase()) +
          "/records",
      );
      setSelected(d.patient);
      setRecords(d.records);
      setTab("patients");
    } catch (e) {
      setSelected(null);
      setRecords([]);
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const tabs = patient
    ? [
        ["overview", "Overview", FiGrid],
        ["records", "My records", FiFolder],
        ["sharing", "Sharing & access", FiUsers],
        ["activity", "Activity", FiClock],
      ]
    : [
        ["overview", "Overview", FiGrid],
        ["patients", "Shared patients", FiUsers],
      ];
  return (
    <main className="workspace" id="main">
      <aside className="sidebar">
        <div className="workspace-label">
          {patient ? "PATIENT" : "DOCTOR"} WORKSPACE
        </div>
        <nav aria-label="Workspace navigation">
          {tabs.map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setMessage("");
              }}
              className={tab === id ? "active" : ""}
              aria-current={tab === id ? "page" : undefined}
            >
              <Icon />
              {label}
              {id === "records" && <span>{records.length}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <FiShield />
            <strong>A little reminder</strong>
            <p>
              This is a project showcase. Please use synthetic documents only.
            </p>
            <Link to="/privacy">
              Read the limitations <FiArrowUpRight />
            </Link>
          </div>
          <button className="text-btn" onClick={logout}>
            <FiLogOut /> Sign out
          </button>
        </div>
      </aside>
      <section className="workspace-main">
        <div className="workspace-top">
          <span>
            <span className="dot" /> YOUR CONNECTED HEALTH SPACE
          </span>
          <span className="user-avatar" title={user.name}>
            {initials(user.name)}
          </span>
        </div>
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">
              {tab === "overview"
                ? "A LITTLE MORE ORGANISED"
                : patient
                  ? "YOUR PERSONAL HEALTH SPACE"
                  : "CONSENT-BASED RECORD ACCESS"}
            </span>
            <h1>
              {tab === "overview"
                ? `Hello, ${user.name.split(" ")[0]}.`
                : tabs.find((t) => t[0] === tab)?.[1]}
            </h1>
            <p>
              {patient
                ? "Your health story, together in one place."
                : "A clearer view of the records patients choose to share."}
            </p>
          </div>
          {patient && (
            <button className="btn" onClick={() => setUpload(true)}>
              <FiPlus /> Add a record
            </button>
          )}
        </div>
        <Notice error>{error}</Notice>
        <Notice>{message}</Notice>
        <div className="code-card">
          <div>
            <FiShield />
            <span>Your {patient ? "patient" : "doctor"} code</span>
            <strong>{user.code}</strong>
          </div>
          <button
            className="text-btn"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(user.code);
                setMessage("Code copied.");
              } catch {
                setMessage("Select and copy your code: " + user.code);
              }
            }}
          >
            <FiCopy /> Copy code
          </button>
          <small>
            {patient
              ? "A code identifies you. It does not grant access."
              : "Give this code to a patient so they can grant you access."}
          </small>
        </div>
        {busy ? (
          <div className="loading-state" role="status">
            Loading your workspace…
          </div>
        ) : (
          <>
            {tab === "overview" && (
              <>
                <div className="stats-grid">
                  {(patient
                    ? [
                        [FiFolder, records.length, "Records in your library"],
                        [FiUsers, grants.length, "Doctors with access"],
                        [FiClock, "24h", "Sharing permission window"],
                      ]
                    : [
                        [FiUsers, patients.length, "Patients sharing with you"],
                        [FiShield, "Consent", "Required for every patient"],
                        [FiClock, "24h", "Time-limited access"],
                      ]
                  ).map(([Icon, n, t]) => (
                    <article className="stat-card" key={t}>
                      <span className="icon-box">
                        <Icon />
                      </span>
                      <strong>{n}</strong>
                      <span>{t}</span>
                    </article>
                  ))}
                </div>
                <div className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>
                        {patient
                          ? "Your recent records"
                          : "Patients connected with you"}
                      </h2>
                      <p>
                        {patient
                          ? "The details you need, when you need them."
                          : "Only patients with an active sharing permission appear here."}
                      </p>
                    </div>
                    <button
                      className="text-link"
                      onClick={() => setTab(patient ? "records" : "patients")}
                    >
                      View all <FiArrowRight />
                    </button>
                  </div>
                  {patient ? (
                    <Records
                      records={records.slice(0, 5)}
                      canDelete
                      onDelete={setDeleting}
                      onDownload={download}
                    />
                  ) : (
                    <PatientList patients={patients} onSelect={lookup} />
                  )}
                </div>
                <div className="workspace-banner">
                  <span className="icon-box">
                    <FiHeart />
                  </span>
                  <div>
                    <h3>
                      {patient
                        ? "Good care starts with a clear picture."
                        : "Consent is the connection."}
                    </h3>
                    <p>
                      {patient
                        ? "Bring a report from your last visit into your personal library."
                        : "Patient approval is required before you can view or download records."}
                    </p>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => setTab(patient ? "sharing" : "patients")}
                  >
                    {patient ? "Manage sharing" : "Open shared patients"}{" "}
                    <FiArrowRight />
                  </button>
                </div>
              </>
            )}
            {tab === "records" && (
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>
                      Document library{" "}
                      <span className="pill">{records.length} / 30</span>
                    </h2>
                    <p>Search, organise and download your medical documents.</p>
                  </div>
                </div>
                <Records
                  records={records}
                  canDelete
                  onDelete={setDeleting}
                  onDownload={download}
                />
              </div>
            )}
            {tab === "sharing" && (
              <>
                <div className="panel share-panel">
                  <span className="icon-box">
                    <FiUsers />
                  </span>
                  <h2>Connect with your doctor.</h2>
                  <p>
                    Ask your doctor for their code. Grant them read and download
                    access to your complete library for 24 hours, including new
                    records. You can revoke it at any time.
                  </p>
                  <form className="inline-form" onSubmit={share}>
                    <label>
                      Doctor code
                      <input
                        name="code"
                        placeholder="10-character doctor code"
                        pattern="[a-fA-F0-9]{10}"
                        maxLength={10}
                        required
                      />
                    </label>
                    <button className="btn" disabled={actionBusy}>
                      Grant access <FiArrowRight />
                    </button>
                  </form>
                  <small className="muted">
                    A revoked permission cannot recall copies already
                    downloaded.
                  </small>
                </div>
                <div className="panel">
                  <div className="panel-heading">
                    <h2>Active permissions</h2>
                  </div>
                  {grants.length ? (
                    grants.map((g) => (
                      <div className="permission-row" key={g.code}>
                        <span className="user-avatar">{initials(g.name)}</span>
                        <div>
                          <strong>{g.name}</strong>
                          <small>
                            {g.email} · Expires{" "}
                            {new Date(g.expires_at).toLocaleString("en-IN")}
                          </small>
                        </div>
                        <button
                          className="btn secondary small"
                          disabled={actionBusy}
                          onClick={() => revoke(g.code)}
                        >
                          Revoke access
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <FiShield />
                      <h3>Your records are just yours.</h3>
                      <p>No doctors have active access.</p>
                    </div>
                  )}
                </div>
              </>
            )}
            {tab === "activity" && (
              <div className="panel">
                <div className="panel-heading">
                  <div>
                    <h2>Your record timeline</h2>
                    <p>
                      The latest 30 uploads, downloads, views and permission
                      changes.
                    </p>
                  </div>
                </div>
                {activity.length ? (
                  <ol className="activity-list">
                    {activity.map((a) => (
                      <li key={a.id}>
                        <span className="timeline-dot" />
                        <div>
                          <strong>{a.action}</strong>
                          <p>
                            {a.actor}{" "}
                            <span>
                              · {new Date(a.created_at).toLocaleString("en-IN")}
                            </span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <div className="empty-state">
                    <FiClock />
                    <h3>A fresh start.</h3>
                    <p>Your record activity will appear here.</p>
                  </div>
                )}
              </div>
            )}
            {tab === "patients" && (
              <>
                <div className="panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Find shared records</h2>
                      <p>
                        A patient must grant permission using your doctor code
                        first.
                      </p>
                    </div>
                  </div>
                  <form
                    className="inline-form lookup-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      lookup(new FormData(e.currentTarget).get("code"));
                    }}
                  >
                    <label>
                      Patient code
                      <input
                        name="code"
                        placeholder="10-character patient code"
                        pattern="[a-fA-F0-9]{10}"
                        maxLength={10}
                        required
                      />
                    </label>
                    <button className="btn">
                      Open records <FiSearch />
                    </button>
                  </form>
                  <PatientList patients={patients} onSelect={lookup} />
                </div>
                {selected && (
                  <div className="panel">
                    <div className="panel-heading">
                      <div>
                        <span className="eyebrow">SHARED LIBRARY</span>
                        <h2>{selected.name}</h2>
                        <p>{selected.code} · Read-only access</p>
                      </div>
                      <button
                        className="text-btn"
                        onClick={() => {
                          setSelected(null);
                          setRecords([]);
                        }}
                      >
                        Close library <FiX />
                      </button>
                    </div>
                    <Records records={records} onDownload={download} />
                  </div>
                )}
              </>
            )}
          </>
        )}
        <div className="workspace-footnote">
          <FiLock /> Private by default. Shared only by patient choice.{" "}
          <Link to="/privacy">Showcase limitations</Link>
        </div>
      </section>
      {upload && (
        <UploadModal
          onClose={() => setUpload(false)}
          onSaved={() => {
            setUpload(false);
            setMessage("Record added to your library.");
            refresh();
          }}
        />
      )}
      {deleting && (
        <Modal
          title="Delete this document?"
          onClose={() => !actionBusy && setDeleting(null)}
        >
          <p>
            “{deleting.title}” will be removed from your library. This cannot be
            undone.
          </p>
          <div className="button-row">
            <button
              className="btn secondary"
              disabled={actionBusy}
              onClick={() => setDeleting(null)}
            >
              Keep document
            </button>
            <button
              className="btn destructive"
              disabled={actionBusy}
              onClick={remove}
            >
              {actionBusy ? "Deleting…" : "Delete document"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

export default Dashboard;
