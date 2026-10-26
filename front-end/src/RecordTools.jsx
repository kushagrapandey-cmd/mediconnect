import React, { useState } from 'react';
import { Modal, Notice, api, categories } from './shared';
export function RecordPreview({record,onClose}) {
  return <Modal title={record.title} onClose={onClose}>
    <p className="muted">Private preview · Access is checked when the file loads. Downloaded or displayed copies cannot be recalled.</p>
    {record.mime==='application/pdf'
      ? <iframe className="document-preview" title={`Preview of ${record.title}`} src={`/api/records/${record.id}/preview`} />
      : <img className="document-image" alt={record.title} src={`/api/records/${record.id}/preview`} />}
    <p className="muted">If your browser cannot display this file, close the preview and use Download. Access errors appear inside the preview.</p>
  </Modal>;
}
export function RecordEdit({record,onClose,onSaved}) {
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function save(e){e.preventDefault();setBusy(true);setError('');const body=Object.fromEntries(new FormData(e.currentTarget));try{await api(`/records/${record.id}`,{method:'PATCH',body:JSON.stringify(body)});onSaved();}catch(e){setError(e.message);}finally{setBusy(false);}}
  return <Modal title="Edit document details" onClose={()=>!busy&&onClose()}><form className="tool-form" onSubmit={save}>
    <p className="muted">Update the label and date. The original file stays intact.</p><Notice error>{error}</Notice>
    <label>Document title<input name="title" defaultValue={record.title} minLength={2} maxLength={120} required /></label>
    <label>Category<select name="category" defaultValue={record.category}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>Record date<input name="recordDate" type="date" defaultValue={record.record_date.slice(0,10)} min="1900-01-01" max={new Date().toISOString().slice(0,10)} required /></label>
    <button className="btn" disabled={busy}>{busy?'Saving…':'Save changes'}</button>
  </form></Modal>;
}
