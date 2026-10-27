const express = require("express");
const { digest } = require("./security");
function validateFeedback(body) {
  const { name = "", email = "", message, requestId } = body;
  if (typeof name !== "string" || name.length > 80) return "Use a name of up to 80 characters.";
  if (typeof email !== "string" || email.length > 254 || (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) return "Enter a valid reply email or leave it empty.";
  if (typeof message !== "string" || message.trim().length < 10 || message.length > 2000) return "Write feedback between 10 and 2,000 characters.";
  if (typeof requestId !== "string" || !/^[a-f0-9-]{36}$/i.test(requestId)) return "Refresh the page and try again.";
  return null;
}
function feedbackRouter({wrap,fail,limit,clientKey}) {
  const router = express.Router();
  router.post("/feedback",wrap(async(req,res)=>{
    const error = validateFeedback(req.body);
    if (error) throw fail(400,error);
    if (req.body.website) return res.json({ok:true});
    await limit(`feedback-ip:${clientKey(req)}`,3);
    await limit("feedback-global",10);
    const key=process.env.FEEDBACK_RESEND_API_KEY;
    if(!key) throw fail(503,"Feedback email is temporarily unavailable. Please use the Email link below.");
    const {name="",email="",message,requestId}=req.body;
    const text=`MediConnect website feedback\n\nName: ${name.trim()||"Not provided"}\nReply email: ${email.trim()||"Not provided"}\n\nMessage:\n${message.trim()}\n\nThis is visitor-submitted feedback, not a verified identity or medical record.`;
    let response;
    try {
      response=await fetch("https://api.resend.com/emails",{method:"POST",signal:AbortSignal.timeout(12000),headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json","Idempotency-Key":`mc-feedback-${digest(requestId+text)}`},body:JSON.stringify({from:process.env.FEEDBACK_MAIL_FROM||"MediConnect <onboarding@resend.dev>",to:["kushagrapandey102@gmail.com"],subject:"MediConnect — new website feedback",text,...(email.trim()?{reply_to:email.trim()}:{})})});
    } catch { throw fail(503,"Email submission could not be confirmed. Please retry or use the Email link below."); }
    const data=await response.json().catch(()=>({}));
    if(!response.ok || !data.id) {
      console.error("Feedback email rejected",response.status);
      throw fail(503,"Feedback email is temporarily unavailable. Please use the Email link below.");
    }
    res.json({ok:true});
  }));
  return router;
}
module.exports={feedbackRouter,validateFeedback};
