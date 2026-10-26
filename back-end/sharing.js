const express = require("express");
const { randomUUID } = require("node:crypto");
const { getSql } = require("./db");
const { validateScope } = require("./validation");
module.exports = ({wrap,fail,limit,patient,doctor,audit,uuid,metadata}) => {
  const router=express.Router();
  const codeOf = value => typeof value === "string" && /^[a-fA-F0-9]{10}$/.test(value.trim()) ? value.trim().toUpperCase() : null;
  router.get("/doctors/:code",patient,wrap(async(req,res)=>{
    await limit(`doctor-review:${req.user.id}`,40);
    const code=codeOf(req.params.code);
    const [d]=await getSql()`SELECT name,email,code,email_verified FROM mc_users WHERE code=${code} AND role='doctor'`;
    if(!d)throw fail(404,"No doctor found with that code.");
    res.json({doctor:d});
  }));
  router.get("/grants",patient,wrap(async(req,res)=>{
    const grants=await getSql()`SELECT u.name,u.email,u.code,g.expires_at,g.record_ids FROM mc_grants g JOIN mc_users u ON u.id=g.doctor_id WHERE g.patient_id=${req.user.id} AND g.expires_at>now() ORDER BY g.expires_at DESC`;
    res.json({grants});
  }));
  router.post("/grants",patient,wrap(async(req,res)=>{
    const error=validateScope(req.body,uuid);if(error)throw fail(400,error);
    const code=codeOf(req.body.code);if(!code)throw fail(400,"Enter the 10-character doctor code.");
    await limit(`grant:${req.user.id}`,20);
    const {recordIds,hours}=req.body;
    const rows=await getSql()`INSERT INTO mc_grants(patient_id,doctor_id,expires_at,record_ids)
      SELECT ${req.user.id},u.id,now()+${hours}*interval '1 hour',${JSON.stringify(recordIds)}::jsonb FROM mc_users u
      WHERE u.code=${code} AND u.role='doctor' AND (SELECT count(*) FROM mc_records WHERE owner_id=${req.user.id} AND id=ANY(${recordIds}::uuid[]))=${recordIds.length}
      ON CONFLICT(patient_id,doctor_id) DO UPDATE SET expires_at=excluded.expires_at,record_ids=excluded.record_ids RETURNING doctor_id`;
    if(!rows.length)throw fail(400,"Check the doctor code and select documents from your own library.");
    await audit(req.user.id,req.user.name,`Shared ${recordIds.length} selected documents for ${hours} hours`);
    res.status(201).json({ok:true});
  }));
  router.delete("/grants/:code",patient,wrap(async(req,res)=>{
    await getSql()`DELETE FROM mc_grants WHERE patient_id=${req.user.id} AND doctor_id IN (SELECT id FROM mc_users WHERE code=${codeOf(req.params.code)})`;
    await audit(req.user.id,req.user.name,"Revoked doctor access");res.json({ok:true});
  }));
  router.get("/access-requests",wrap(async(req,res)=>{
    const q=getSql();
    const requests=req.user.role==='patient'
      ? await q`SELECT r.id,r.purpose,r.status,r.created_at,r.expires_at,u.name,u.email,u.code,u.email_verified FROM mc_access_requests r JOIN mc_users u ON u.id=r.doctor_id WHERE r.patient_id=${req.user.id} AND r.expires_at>now() ORDER BY r.created_at DESC LIMIT 30`
      : await q`SELECT r.id,r.purpose,r.status,r.created_at,r.expires_at FROM mc_access_requests r WHERE r.doctor_id=${req.user.id} AND r.expires_at>now() ORDER BY r.created_at DESC LIMIT 30`;
    res.json({requests});
  }));
  router.post("/access-requests",doctor,wrap(async(req,res)=>{
    const code=codeOf(req.body.code),purpose=req.body.purpose;
    if(!code || typeof purpose!=="string" || purpose.trim().length<5 || purpose.length>240)throw fail(400,"Enter a patient code and a reason between 5 and 240 characters.");
    await limit(`request:${req.user.id}`,15);
    // A generic response avoids revealing whether an unconsenting patient exists.
    await getSql()`INSERT INTO mc_access_requests(id,patient_id,doctor_id,purpose)
      SELECT ${randomUUID()},u.id,${req.user.id},${purpose.trim()} FROM mc_users u WHERE u.code=${code} AND u.role='patient'
      AND (SELECT count(*) FROM mc_access_requests WHERE patient_id=u.id AND status='pending' AND expires_at>now())<30
      ON CONFLICT(patient_id,doctor_id) DO UPDATE SET purpose=excluded.purpose,status='pending',created_at=now(),expires_at=now()+interval '7 days'
      WHERE mc_access_requests.status<>'pending' OR mc_access_requests.expires_at<=now()`;
    res.status(202).json({message:"If the patient code is valid, a request is available in their Sharing & access tab. No record access has been granted."});
  }));
  router.post("/access-requests/:id/decision",patient,wrap(async(req,res)=>{
    if(!uuid(req.params.id))throw fail(404,"Request not found.");
    const {decision,recordIds,hours}=req.body;
    if(!['approve','deny'].includes(decision))throw fail(400,"Choose Approve or Deny.");
    if(decision==='deny'){
      const rows=await getSql()`UPDATE mc_access_requests SET status='denied' WHERE id=${req.params.id} AND patient_id=${req.user.id} AND status='pending' AND expires_at>now() RETURNING id`;
      if(!rows.length)throw fail(409,"Request is no longer pending. Refresh the list.");
    }else{
      const error=validateScope(req.body,uuid);if(error)throw fail(400,error);
      const rows=await getSql()`WITH accepted AS (
        UPDATE mc_access_requests SET status='approved' WHERE id=${req.params.id} AND patient_id=${req.user.id} AND status='pending' AND expires_at>now()
        AND (SELECT count(*) FROM mc_records WHERE owner_id=${req.user.id} AND id=ANY(${recordIds}::uuid[]))=${recordIds.length} RETURNING doctor_id
      ) INSERT INTO mc_grants(patient_id,doctor_id,expires_at,record_ids) SELECT ${req.user.id},doctor_id,now()+${hours}*interval '1 hour',${JSON.stringify(recordIds)}::jsonb FROM accepted
      ON CONFLICT(patient_id,doctor_id) DO UPDATE SET expires_at=excluded.expires_at,record_ids=excluded.record_ids RETURNING doctor_id`;
      if(!rows.length)throw fail(409,"Request changed or selected documents are unavailable. Refresh and try again.");
    }
    await audit(req.user.id,req.user.name,decision==='deny'?"Denied a doctor access request":`Approved doctor request: ${recordIds.length} documents for ${hours} hours`);
    res.json({ok:true});
  }));
  router.get("/patients",doctor,wrap(async(req,res)=>{
    const patients=await getSql()`SELECT u.name,u.code,g.expires_at,g.record_ids FROM mc_grants g JOIN mc_users u ON u.id=g.patient_id WHERE g.doctor_id=${req.user.id} AND g.expires_at>now() ORDER BY u.name`;
    res.json({patients});
  }));
  router.get("/patients/:code/records",doctor,wrap(async(req,res)=>{
    await limit(`lookup:${req.user.id}`,60);
    const q=getSql(),code=codeOf(req.params.code);
    const [p]=await q`SELECT u.id,u.name,u.code,g.expires_at FROM mc_users u JOIN mc_grants g ON g.patient_id=u.id WHERE u.code=${code} AND u.role='patient' AND g.doctor_id=${req.user.id} AND g.expires_at>now()`;
    if(!p)throw fail(404,"Patient not found or sharing permission has not been granted.");
    const records=await q.query(`SELECT ${metadata.split(', ').map(c=>'r.'+c).join(', ')} FROM mc_records r JOIN mc_grants g ON g.patient_id=r.owner_id WHERE r.owner_id=$1 AND g.doctor_id=$2 AND g.expires_at>now() AND (g.record_ids IS NULL OR g.record_ids ? r.id::text) ORDER BY r.record_date DESC,r.created_at DESC`,[p.id,req.user.id]);
    await audit(p.id,req.user.name,"Viewed shared records");
    res.json({patient:{name:p.name,code:p.code,expires_at:p.expires_at},records});
  }));
  return router;
};
