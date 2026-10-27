const {test}=require('node:test');
const assert=require('node:assert/strict');
const express=require('express');
const request=require('supertest');
const {feedbackRouter,validateFeedback}=require('../back-end/feedback');
const body={name:'Test visitor',email:'visitor@example.test',message:'Synthetic feedback test message.',requestId:'11111111-1111-4111-8111-111111111111'};
test('feedback validates message, reply address and input types',()=>{
 assert.equal(validateFeedback(body),null);
 for(const bad of [{message:'short'},{email:'bad'},{name:{}},{message:'x'.repeat(2001)},{requestId:null}])assert.ok(validateFeedback({...body,...bad}));
});
test('feedback fixes recipient and sender while returning truthful send failures',async()=>{
 const savedFetch=global.fetch,key=process.env.FEEDBACK_RESEND_API_KEY;
 process.env.FEEDBACK_RESEND_API_KEY='test-only';
 let sent;
 const app=express();app.use(express.json());app.use(feedbackRouter({wrap:fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next),fail:(status,message)=>Object.assign(Error(message),{status}),limit:async()=>{},clientKey:()=> 'test'}));app.use((e,req,res,next)=>res.status(e.status||500).json({message:e.message}));
 try{
 global.fetch=async(url,opts)=>{sent=JSON.parse(opts.body);return {ok:true,status:200,json:async()=>({id:'synthetic-id'})}};
 let r=await request(app).post('/feedback').send({...body,to:'attacker@example.test'});assert.equal(r.status,200);assert.deepEqual(sent.to,['kushagrapandey102@gmail.com']);assert.equal(sent.reply_to,body.email);assert.match(sent.from,/onboarding@resend.dev/);
 global.fetch=async()=>({ok:false,status:403,json:async()=>({})});r=await request(app).post('/feedback').send(body);assert.equal(r.status,503);
 global.fetch=async()=>{throw Error('timeout')};r=await request(app).post('/feedback').send(body);assert.equal(r.status,503);
 }finally{global.fetch=savedFetch;if(key===undefined)delete process.env.FEEDBACK_RESEND_API_KEY;else process.env.FEEDBACK_RESEND_API_KEY=key;}
});
