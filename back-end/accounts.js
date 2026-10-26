const express=require('express');
const {randomBytes}=require('node:crypto');
const {getSql}=require('./db');
const {digest,hashPassword,verifyPassword}=require('./security');
const passwordOK=p=>typeof p==='string'&&p.length>=10&&p.length<=128;
const emailOK=e=>typeof e==='string'&&e.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const mailReady=()=>!!(process.env.RESEND_API_KEY&&process.env.MAIL_FROM&&process.env.APP_ORIGIN?.startsWith('https://'));
async function deliver(to,kind,token){
  const origin=new URL(process.env.APP_ORIGIN).origin;
  const url=`${origin}/account-action#${new URLSearchParams({kind,token})}`;
  const action=kind==='verify'?'Verify your email':'Reset your password';
  const response=await fetch('https://api.resend.com/emails',{
    method:'POST',signal:AbortSignal.timeout(10000),
    headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`mc-${kind}-${digest(token)}`},
    body:JSON.stringify({from:process.env.MAIL_FROM,to:[to],subject:`${action} for MediConnect`,text:`${action} for MediConnect:\n\n${url}\n\nThis single-use link expires in 30 minutes. If you did not request this, ignore this email. Never share the link or your password.`})
  });
  if(!response.ok)throw new Error('MAIL_DELIVERY_FAILED');
}
module.exports=({wrap,fail,limit,safeUser,auth})=>{
  const publicRoutes=express.Router(),privateRoutes=express.Router();
  publicRoutes.get('/auth/options',(req,res)=>res.json({emailDelivery:mailReady(),recoveryKey:true}));
  publicRoutes.post('/auth/recover',wrap(async(req,res)=>{
    const {email,recoveryKey,password}=req.body;
    if(!emailOK(email)||typeof recoveryKey!=='string'||!/^[a-f0-9]{48}$/.test(recoveryKey)||!passwordOK(password))throw fail(400,'Enter your email, 48-character recovery key and a new password of 10–128 characters.');
    await limit(`recover:${req.socket.remoteAddress}`,10);await limit(`recover-email:${email.trim().toLowerCase()}`,5);
    const key=randomBytes(24).toString('hex'),hash=await hashPassword(password);
    const [u]=await getSql()`WITH changed AS (UPDATE mc_users SET password=${hash},recovery_hash=${digest(key)} WHERE email=${email.trim().toLowerCase()} AND recovery_hash=${digest(recoveryKey)} RETURNING id), cleared AS (DELETE FROM mc_sessions WHERE user_id IN (SELECT id FROM changed)) SELECT id FROM changed`;
    if(!u)throw fail(400,'Email or recovery key is incorrect.');
    await getSql()`DELETE FROM mc_account_tokens WHERE user_id=${u.id}`;
    res.json({ok:true,recoveryKey:key});
  }));
  publicRoutes.post('/auth/forgot-password',wrap(async(req,res)=>{
    if(!mailReady())throw fail(503,'Email recovery is not configured. Use your saved recovery key.');
    if(!emailOK(req.body.email))throw fail(400,'Enter a valid email address.');
    const email=req.body.email.trim().toLowerCase();
    await limit(`forgot:${req.socket.remoteAddress}`,10);await limit(`forgot-email:${email}`,3);
    const [u]=await getSql()`SELECT id,email FROM mc_users WHERE email=${email} AND email_verified=true`;
    if(u){
      const token=randomBytes(32).toString('hex');
      await getSql()`DELETE FROM mc_account_tokens WHERE user_id=${u.id} AND kind='reset'`;
      await getSql()`INSERT INTO mc_account_tokens(token,user_id,kind,expires_at) VALUES (${digest(token)},${u.id},'reset',now()+interval '30 minutes')`;
      try{await deliver(u.email,'reset',token);}catch{console.error('Account email delivery failed');}
    }
    res.json({message:'If the email belongs to a verified account, a reset link will be sent.'});
  }));
  publicRoutes.post('/auth/complete',wrap(async(req,res)=>{
    const {token,kind,password}=req.body;
    if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token)||!['verify','reset'].includes(kind))throw fail(400,'Invalid account link.');
    await limit(`complete:${req.socket.remoteAddress}`,20);
    if(kind==='reset'&&!passwordOK(password))throw fail(400,'Use a password between 10 and 128 characters.');
    const key=randomBytes(24).toString('hex');
    const q=getSql(),hash=kind==='reset'?await hashPassword(password):null;
    const rows=kind==='verify'
      ? await q`WITH used AS (DELETE FROM mc_account_tokens WHERE token=${digest(token)} AND kind='verify' AND expires_at>now() RETURNING user_id) UPDATE mc_users SET email_verified=true WHERE id IN (SELECT user_id FROM used) RETURNING id`
      : await q`WITH used AS (DELETE FROM mc_account_tokens WHERE token=${digest(token)} AND kind='reset' AND expires_at>now() RETURNING user_id), changed AS (UPDATE mc_users SET password=${hash},recovery_hash=${digest(key)} WHERE id IN (SELECT user_id FROM used) RETURNING id), cleared AS (DELETE FROM mc_sessions WHERE user_id IN (SELECT id FROM changed)) SELECT id FROM changed`;
    if(!rows.length)throw fail(400,'This link has expired or has already been used.');
    res.json({ok:true,...(kind==='reset'?{recoveryKey:key}:{})});
  }));
  privateRoutes.patch('/account/profile',wrap(async(req,res)=>{
    const {name}=req.body;
    if(typeof name!=='string'||name.trim().length<2||name.length>80)throw fail(400,'Enter a name between 2 and 80 characters.');
    const [u]=await getSql()`UPDATE mc_users SET name=${name.trim()} WHERE id=${req.user.id} RETURNING *`;
    res.json({user:safeUser(u)});
  }));
  privateRoutes.post('/account/password',wrap(async(req,res)=>{
    const {currentPassword,password}=req.body;
    if(typeof currentPassword!=='string'||currentPassword.length>128||!passwordOK(password))throw fail(400,'Enter your current password and a new password of 10–128 characters.');
    await limit(`change-password:${req.user.id}`,5);
    if(!await verifyPassword(currentPassword,req.user.password))throw fail(400,'Current password is incorrect.');
    const hash=await hashPassword(password);
    const rows=await getSql()`WITH changed AS (UPDATE mc_users SET password=${hash} WHERE id=${req.user.id} AND password=${req.user.password} RETURNING id), cleared AS (DELETE FROM mc_sessions WHERE user_id IN (SELECT id FROM changed)) SELECT id FROM changed`;
    if(!rows.length)throw fail(409,'Account changed. Sign in again.');
    await getSql()`DELETE FROM mc_account_tokens WHERE user_id=${req.user.id}`;
    res.clearCookie('mc_session',{path:'/'});res.json({ok:true});
  }));
  privateRoutes.get('/account/sessions',wrap(async(req,res)=>{
    const rows=await getSql()`SELECT token,device,created_at,expires_at FROM mc_sessions WHERE user_id=${req.user.id} AND expires_at>now() ORDER BY created_at DESC`;
    res.json({sessions:rows.map(s=>({device:s.device,createdAt:s.created_at,expiresAt:s.expires_at,current:s.token===req.sessionHash}))});
  }));
  privateRoutes.post('/account/logout-all',wrap(async(req,res)=>{
    await getSql()`DELETE FROM mc_sessions WHERE user_id=${req.user.id}`;
    res.clearCookie('mc_session',{path:'/'});res.json({ok:true});
  }));
  privateRoutes.post('/account/recovery-key',wrap(async(req,res)=>{
    const password=req.body.password;
    await limit(`recovery-key:${req.user.id}`,5);
    if(typeof password!=='string'||password.length>128||!await verifyPassword(password,req.user.password))throw fail(400,'Current password is incorrect.');
    const key=randomBytes(24).toString('hex');
    await getSql()`UPDATE mc_users SET recovery_hash=${digest(key)} WHERE id=${req.user.id}`;
    res.json({recoveryKey:key});
  }));
  privateRoutes.post('/account/verify-email',wrap(async(req,res)=>{
    if(!mailReady())throw fail(503,'Email verification is awaiting sending-domain configuration.');
    if(req.user.email_verified)return res.json({message:'Email already verified.'});
    await limit(`verify:${req.user.id}`,1);
    const token=randomBytes(32).toString('hex');
    await getSql()`DELETE FROM mc_account_tokens WHERE user_id=${req.user.id} AND kind='verify'`;
    await getSql()`INSERT INTO mc_account_tokens(token,user_id,kind,expires_at) VALUES (${digest(token)},${req.user.id},'verify',now()+interval '30 minutes')`;
    try{await deliver(req.user.email,'verify',token);}catch{throw fail(503,'Could not send verification email. Please try again later.');}
    res.json({message:'Verification email sent. The link expires in 30 minutes.'});
  }));
  return {publicRoutes,privateRoutes};
};
