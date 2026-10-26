// Run against a designated test deployment with synthetic accounts only.
const assert=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const fs=require('node:fs');
const base=process.env.BASE_URL;
if(!base)throw Error('BASE_URL is required');
const stamp=Date.now(),password=randomBytes(20).toString('hex');
let checks=0;
function check(label,actual,expected){assert.deepEqual(actual,expected,label);console.log('PASS',label);checks++;}
class Client{
 cookie='';user=null;key=null;
 async req(path,method='GET',body){const form=body instanceof FormData;const r=await fetch(base+'/api'+path,{method,headers:{cookie:[process.env.TEST_ACCESS_COOKIE,this.cookie].filter(Boolean).join('; '),...(body&&!form?{'Content-Type':'application/json'}:{})},body:body?(form?body:JSON.stringify(body)):undefined,signal:AbortSignal.timeout(45000)});const c=r.headers.get('set-cookie');if(c)this.cookie=c.split(';')[0];const bytes=Buffer.from(await r.arrayBuffer());let data;try{data=JSON.parse(bytes)}catch{}return {status:r.status,data,bytes,headers:r.headers};}
 async signup(role,label){const r=await this.req('/auth/signup','POST',{name:`QA ${label}`,email:`consent-${label}-${stamp}@example.test`,password,role});check(label+' signup',r.status,201);this.user=r.data.user;this.key=r.data.recoveryKey;}
}
(async()=>{
 const p=new Client(),d=new Client(),other=new Client(),guest=new Client();
 await p.signup('patient','Patient');await d.signup('doctor','Doctor');await other.signup('patient','Other');
 const ids=[];
 async function upload(title){const f=new FormData();f.set('file',new Blob(['%PDF-1.4\nSynthetic consent test\n%%EOF'],{type:'application/pdf'}),'test.pdf');f.set('title',title);f.set('category','Lab report');f.set('recordDate','2026-01-10');const r=await p.req('/records','POST',f);check('Upload '+title,r.status,201);ids.push(r.data.record.id);return r.data.record.id;}
 const first=await upload('Selected report'),second=await upload('Private report');
 check('No access before request',(await d.req(`/records/${first}/preview`)).status,404);
 check('Request accepted',(await d.req('/access-requests','POST',{code:p.user.code,purpose:'Review synthetic follow-up records'})).status,202);
 let requests=(await p.req('/access-requests')).data.requests;check('Patient receives request',requests.length,1);const id=requests[0].id;
 check('Request grants no access',(await d.req(`/records/${first}/download`)).status,404);
 check('Other patient cannot approve',(await other.req(`/access-requests/${id}/decision`,'POST',{decision:'approve',recordIds:[first],hours:1})).status,409);
 check('Doctor cannot self-approve',(await d.req(`/access-requests/${id}/decision`,'POST',{decision:'approve',recordIds:[first],hours:1})).status,403);
 check('Empty scope rejected',(await p.req(`/access-requests/${id}/decision`,'POST',{decision:'approve',recordIds:[],hours:1})).status,400);
 check('Patient approves one record',(await p.req(`/access-requests/${id}/decision`,'POST',{decision:'approve',recordIds:[first],hours:1})).status,200);
 check('Repeated decision rejected',(await p.req(`/access-requests/${id}/decision`,'POST',{decision:'deny'})).status,409);
 check('Only selected record listed',(await d.req(`/patients/${p.user.code}/records`)).data.records.map(r=>r.id),[first]);
 let r=await d.req(`/records/${first}/preview`);check('Selected preview allowed',r.status,200);assert.match(r.headers.get('content-disposition'),/^inline/);check('Preview allows only same-origin framing',r.headers.get('x-frame-options'),'SAMEORIGIN');
 check('Unselected preview denied',(await d.req(`/records/${second}/preview`)).status,404);
 check('Unselected download denied',(await d.req(`/records/${second}/download`)).status,404);
 const third=await upload('New private upload');check('New upload remains private',(await d.req(`/records/${third}/download`)).status,404);
 const edit={title:'Updated report',category:'Prescription',recordDate:'2026-01-11'};
 check('Doctor cannot edit',(await d.req(`/records/${first}`,'PATCH',edit)).status,403);
 check('Other patient cannot edit',(await other.req(`/records/${first}`,'PATCH',edit)).status,404);
 check('Owner edits metadata',(await p.req(`/records/${first}`,'PATCH',edit)).data.record.title,'Updated report');
 check('Invalid date rejected',(await p.req(`/records/${first}`,'PATCH',{...edit,recordDate:'2026-02-31'})).status,400);
 check('Revoke',(await p.req(`/grants/${d.user.code}`,'DELETE')).status,200);
 check('Revocation blocks preview',(await d.req(`/records/${first}/preview`)).status,404);
 check('New request',(await d.req('/access-requests','POST',{code:p.user.code,purpose:'Second synthetic request'})).status,202);
 requests=(await p.req('/access-requests')).data.requests;
 check('Deny request',(await p.req(`/access-requests/${requests[0].id}/decision`,'POST',{decision:'deny'})).status,200);
 check('Denied request grants no access',(await d.req(`/records/${first}/download`)).status,404);
 check('Direct scope grant',(await p.req('/grants','POST',{code:d.user.code,recordIds:[second],hours:6})).status,201);
 check('Direct scope exact',(await d.req(`/patients/${p.user.code}/records`)).data.records.map(r=>r.id),[second]);
 await p.req(`/grants/${d.user.code}`,'DELETE');
 check('Name updated',(await p.req('/account/profile','PATCH',{name:'QA Renamed Patient'})).data.user.name,'QA Renamed Patient');
 const sessions=(await p.req('/account/sessions')).data.sessions;check('Current session marked',sessions.some(s=>s.current),true);check('Session hash not returned',sessions.some(s=>'token' in s),false);
 const oldCookie=p.cookie;
 check('Logout all',(await p.req('/account/logout-all','POST')).status,200);p.cookie=oldCookie;check('Old session invalidated',(await p.req('/auth/me')).status,401);
 await p.req('/auth/login','POST',{email:p.user.email,password});
 const nextPassword=randomBytes(20).toString('hex');
 check('Wrong recovery key rejected',(await guest.req('/auth/recover','POST',{email:p.user.email,recoveryKey:'0'.repeat(48),password:nextPassword})).status,400);
 r=await guest.req('/auth/recover','POST',{email:p.user.email,recoveryKey:p.key,password:nextPassword});check('Recovery succeeds',r.status,200);check('Key rotates',r.data.recoveryKey!==p.key,true);
 check('Recovery invalidates session',(await p.req('/auth/me')).status,401);
 check('Old key cannot be replayed',(await guest.req('/auth/recover','POST',{email:p.user.email,recoveryKey:p.key,password})).status,400);
 check('Old password rejected',(await p.req('/auth/login','POST',{email:p.user.email,password})).status,401);
 check('New password works',(await p.req('/auth/login','POST',{email:p.user.email,password:nextPassword})).status,200);
 for(const id of ids)check('Remove test document',(await p.req(`/records/${id}`,'DELETE')).status,200);
 check('Password change',(await p.req('/account/password','POST',{currentPassword:nextPassword,password})).status,200);
 check('Password change signs out',(await p.req('/auth/me')).status,401);
 await d.req('/auth/logout','POST');await other.req('/auth/logout','POST');
 console.log(`${checks} consent/account checks passed; test documents removed.`);
})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1;});
