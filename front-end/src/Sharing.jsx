import React,{useState} from 'react';
import {api,Notice,Modal,initials,date} from './shared';
function ScopePicker({records,value,onChange,hours,setHours}){
  return <><fieldset className="scope-picker"><legend>Choose the documents to share</legend>
    {records.length ? records.map(r=><label className="scope-option" key={r.id}><input type="checkbox" checked={value.includes(r.id)} onChange={e=>onChange(e.target.checked?[...value,r.id]:value.filter(id=>id!==r.id))} /><span><strong>{r.title}</strong><small>{r.category} · {date(r.record_date)}</small></span></label>) : <p>Add a record before granting access.</p>}
  </fieldset><label>Access duration<select value={hours} onChange={e=>setHours(Number(e.target.value))}>{[[1,'1 hour'],[6,'6 hours'],[24,'24 hours'],[72,'3 days'],[168,'7 days']].map(([n,label])=><option key={n} value={n}>{label}</option>)}</select></label>
  <p className="muted">Only these selected documents are shared. New uploads stay private. A new approval replaces this doctor's existing permission. Revocation blocks future requests; it cannot recall saved copies.</p></>;
}
export default function Sharing({patient,records,grants,requests,onRefresh,onMessage}){
  const [error,setError]=useState(''),[busy,setBusy]=useState(false),[review,setReview]=useState(null),[recordIds,setRecordIds]=useState([]),[hours,setHours]=useState(24);
  async function act(fn){setError('');setBusy(true);try{await fn();await onRefresh();}catch(e){setError(e.message);}finally{setBusy(false);}}
  function open(doctor,request){setRecordIds([]);setHours(24);setReview({doctor,request});}
  async function find(e){e.preventDefault();const code=new FormData(e.currentTarget).get('code');await act(async()=>{const d=await api(`/doctors/${encodeURIComponent(code.trim())}`);open(d.doctor,null);});}
  async function request(e){e.preventDefault();const f=e.currentTarget,body=Object.fromEntries(new FormData(f));await act(async()=>{const d=await api('/access-requests',{method:'POST',body:JSON.stringify(body)});onMessage(d.message);f.reset();});}
  async function decide(request,decision){await act(async()=>{await api(`/access-requests/${request.id}/decision`,{method:'POST',body:JSON.stringify({decision,recordIds,hours})});setReview(null);onMessage(decision==='approve'?'Selected documents shared.':'Request denied. No new permission was granted.');});}
  async function grant(){await act(async()=>{await api('/grants',{method:'POST',body:JSON.stringify({code:review.doctor.code,recordIds,hours})});setReview(null);onMessage('Selected documents shared with your chosen expiry.');});}
  return <><Notice error>{error}</Notice>
    <div className="panel"><span className="eyebrow">PATIENT APPROVAL FIRST</span><h2>{patient?'You choose what your doctor sees.':'Request access. Wait for approval.'}</h2>
      <p>{patient?'Review doctor requests below, or find a doctor by code and choose specific records.':'Enter the patient code and a short purpose. The patient chooses documents and expiry in their own account. A request never unlocks records.'}</p>
      <form className="tool-form" onSubmit={patient?find:request}><label>{patient?'Doctor code':'Patient code'}<input name="code" pattern="[a-fA-F0-9]{10}" maxLength={10} placeholder="10-character account code" required /></label>
        {!patient&&<label>Reason for access<textarea name="purpose" minLength={5} maxLength={240} placeholder="For example: review reports before the follow-up visit. Do not include sensitive medical details." required /></label>}
        <button className="btn" disabled={busy}>{patient?'Review doctor':'Send access request'}</button>
      </form><small className="muted">Local consent workflow · UHI-inspired prototype · No live UHI/ABDM network connection.</small>
    </div>
    <div className="panel"><div className="panel-heading"><div><h2>{patient?'Doctor requests':'Your recent requests'}</h2><p>Requests expire after seven days. Refresh to check for updates.</p></div><button className="btn secondary small" disabled={busy} onClick={()=>act(async()=>{})}>Refresh</button></div>
      {requests.length?requests.map(r=><div className="request-card" key={r.id}><div><strong>{patient?r.name:'Access request'}</strong><span className="pill">{r.status}</span></div>{patient&&<small>{r.email} · {r.code} · Self-declared doctor account</small>}<p>{r.purpose}</p><small>{new Date(r.created_at).toLocaleString('en-IN')}</small>
        {patient&&r.status==='pending'&&<div className="tool-actions"><button className="btn small" disabled={busy} onClick={()=>open(r,r)}>Review & choose records</button><button className="btn secondary small" disabled={busy} onClick={()=>decide(r,'deny')}>Deny request</button></div>}
      </div>):<p className="muted">No recent requests.</p>}
    </div>
    {patient&&<div className="panel"><h2>Active permissions</h2>{grants.length?grants.map(g=><div className="permission-row" key={g.code}><span className="user-avatar">{initials(g.name)}</span><div><strong>{g.name}</strong><small>{g.email}</small><small>{g.record_ids===null?'Legacy whole-library permission':`${g.record_ids.length} selected documents`} · Expires {new Date(g.expires_at).toLocaleString('en-IN')}</small></div><button className="btn secondary small" disabled={busy} onClick={()=>act(async()=>{await api(`/grants/${g.code}`,{method:'DELETE'});onMessage('Access revoked for subsequent requests.');})}>Revoke access</button></div>):<p className="muted">No doctors have active access.</p>}</div>}
    {review&&<Modal title="Approve document access" onClose={()=>!busy&&setReview(null)}><div className="tool-form"><Notice error>{error}</Notice><div className="consent-doctor"><strong>{review.doctor.name}</strong><p>{review.doctor.email}</p><code>{review.doctor.code}</code><p className="muted">Self-declared doctor role. {review.doctor.email_verified?'Email verified; medical credentials are not verified.':'Email and medical credentials are not verified.'} Confirm the recipient before sharing.</p>{review.request&&<p>Purpose: {review.request.purpose}</p>}</div>
      <ScopePicker records={records} value={recordIds} onChange={setRecordIds} hours={hours} setHours={setHours}/>
      <button className="btn" disabled={busy||!recordIds.length} onClick={()=>review.request?decide(review.request,'approve'):grant()}>{busy?'Saving…':`Approve access to ${recordIds.length} document${recordIds.length===1?'':'s'}`}</button>
    </div></Modal>}
  </>;
}
