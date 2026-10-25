import React, { useState } from "react";
import { FiPlus, FiUploadCloud, FiDownload } from "react-icons/fi";
import { api, categories, Notice, Modal } from "./shared";
function UploadModal({ onClose, onSaved }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [file, setFile] = useState(null);
  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!file) return setError("Choose a document.");
    if (file.size > 2097152) return setError("Choose a document under 2 MB.");
    setBusy(true);
    const data = new FormData(e.currentTarget);
    try {
      await api("/records", { method: "POST", body: data });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Add a health record" onClose={() => !busy && onClose()}>
      <form onSubmit={submit}>
        <p className="muted">
          Keep the details together. Synthetic documents only.
        </p>
        <Notice error>{error}</Notice>
        <a
          className="text-link"
          href="/assets/sample-record.pdf"
          download="mediconnect-sample-record.pdf"
        >
          Download a synthetic sample record <FiDownload />
        </a>
        <label className="dropzone">
          <FiUploadCloud />
          <strong>{file ? file.name : "Choose your document"}</strong>
          <span>PDF, JPEG or PNG · Maximum 2 MB</span>
          <input
            type="file"
            name="file"
            accept="application/pdf,image/jpeg,image/png"
            required
            onChange={(e) => setFile(e.target.files[0] || null)}
          />
        </label>
        <label>
          Document title
          <input
            name="title"
            placeholder="e.g. Annual blood test"
            minLength={2}
            maxLength={120}
            required
          />
        </label>
        <div className="form-grid">
          <label>
            Category
            <select name="category">
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Record date
            <input
              name="recordDate"
              type="date"
              min="1900-01-01"
              max={new Date().toISOString().slice(0, 10)}
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </label>
        </div>
        <button className="btn full" disabled={busy}>
          {busy ? "Uploading…" : "Save record"} <FiPlus />
        </button>
      </form>
    </Modal>
  );
}

export default UploadModal;
