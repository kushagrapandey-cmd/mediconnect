const express = require("express");
const helmet = require("helmet");
const multer = require("multer");
const { randomBytes, randomUUID } = require("node:crypto");
const path = require("node:path");
const { init, getSql } = require("./db");
const {
  hashPassword,
  verifyPassword,
  digest,
  fileType,
  validateSignup,
} = require("./security");
const app = express();
app.disable("x-powered-by");
app.use(
  helmet({
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://tile.openstreetmap.org"],
        frameSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  }),
);
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && req.headers.origin) {
    const expected =
      process.env.APP_ORIGIN ||
      `${req.headers["x-forwarded-proto"] || req.protocol}://${req.headers.host}`;
    if (req.headers.origin !== expected)
      return res
        .status(403)
        .json({ message: "Cross-site requests are not allowed." });
  }
  next();
});
app.use(express.json({ limit: "32kb" }));
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const fail = (code, message) =>
  Object.assign(new Error(message), { status: code });
const safeUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  code: u.code,
  emailVerified: u.email_verified,
});
const uuid = (x) =>
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(
    x || "",
  );
app.get(
  "/api/health",
  wrap(async (req, res) => {
    await init();
    await getSql()`SELECT 1`;
    res.json({ status: "ok", storage: "connected" });
  }),
);
app.use(
  "/api",
  wrap(async (req, res, next) => {
    await init();
    next();
  }),
);
async function limit(key, max = 15) {
  const q = getSql();
  const [row] =
    await q`INSERT INTO mc_limits(key,hits,expires_at) VALUES (${digest(key)},1,now()+interval '15 minutes') ON CONFLICT(key) DO UPDATE SET hits=CASE WHEN mc_limits.expires_at < now() THEN 1 ELSE mc_limits.hits+1 END, expires_at=CASE WHEN mc_limits.expires_at < now() THEN now()+interval '15 minutes' ELSE mc_limits.expires_at END RETURNING hits`;
  if (row.hits > max)
    throw fail(429, "Too many attempts. Please try again in 15 minutes.");
}
const clientKey = (req) =>
  req.headers["x-vercel-forwarded-for"] ||
  req.socket.remoteAddress ||
  "unknown";
app.use("/api", require("./places")({wrap, limit, clientKey}));
async function session(res, u, req) {
  const token = randomBytes(32).toString("hex");
  const q = getSql();
  // Password mutations take this same lock. Use a separate statement so the
  // credential check sees a fresh snapshot after any lock wait.
  const [, rows] = await q.transaction([
    q`SELECT id FROM mc_users WHERE id=${u.id} FOR UPDATE`,
    q`INSERT INTO mc_sessions(token,user_id,expires_at,device) SELECT ${digest(token)},id,now()+interval '7 days',${String(req?.headers["user-agent"] || "Browser session").slice(0,180)} FROM mc_users WHERE id=${u.id} AND password=${u.password} RETURNING token`,
    q`DELETE FROM mc_sessions WHERE expires_at < now()`,
  ], { isolationLevel: "ReadCommitted" });
  if (!rows.length) throw fail(401, "Account changed. Please sign in again.");
  res.cookie("mc_session", token, {
    httpOnly: true,
    secure: !!process.env.VERCEL,
    sameSite: "lax",
    maxAge: 604800000,
    path: "/",
  });
}
app.post(
  "/api/auth/signup",
  wrap(async (req, res) => {
    const error = validateSignup(req.body);
    if (error) throw fail(400, error);
    await limit(`signup:${clientKey(req)}`, 10);
    const { name, password, role } = req.body,
      email = req.body.email.trim().toLowerCase();
    const q = getSql();
    const recoveryKey = randomBytes(24).toString("hex");
    const [user] =
      await q`INSERT INTO mc_users(id,name,email,password,role,code,recovery_hash) VALUES (${randomUUID()},${name.trim()},${email},${await hashPassword(password)},${role},${randomBytes(5).toString("hex").toUpperCase()},${digest(recoveryKey)}) RETURNING *`;
    await session(res, user, req);
    res.status(201).json({ user: safeUser(user), recoveryKey });
  }),
);
app.post(
  "/api/auth/login",
  wrap(async (req, res) => {
    const { email, password } = req.body;
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      email.length > 254 ||
      password.length > 128
    )
      throw fail(400, "Enter your email and password.");
    await limit(`login:${clientKey(req)}`, 30);
    await limit(`login-email:${email.toLowerCase()}`, 15);
    const [u] =
      await getSql()`SELECT * FROM mc_users WHERE email=${email.trim().toLowerCase()}`;
    const stored =
      u?.password || `00000000000000000000000000000000:${"0".repeat(128)}`;
    if (!(await verifyPassword(password, stored)) || !u)
      throw fail(401, "Email or password is incorrect.");
    await session(res, u, req);
    res.json({ user: safeUser(u) });
  }),
);
const auth = wrap(async (req, res, next) => {
  const token = (req.headers.cookie || "")
    .split(";")
    .map((x) => x.trim())
    .find((x) => x.startsWith("mc_session="))
    ?.slice(11);
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    throw fail(401, "Please sign in to continue.");
  const [u] =
    await getSql()`SELECT u.* FROM mc_sessions s JOIN mc_users u ON u.id=s.user_id WHERE s.token=${digest(token)} AND s.expires_at>now()`;
  if (!u) throw fail(401, "Your session has expired. Please sign in again.");
  req.user = u;
  req.sessionHash = digest(token);
  next();
});
const accountTools = require("./accounts")({ wrap, fail, limit, safeUser, clientKey });
app.use("/api", accountTools.publicRoutes);
app.use("/api", require("./feedback").feedbackRouter({wrap,fail,limit,clientKey}));
app.use("/api", auth);
app.use("/api", accountTools.privateRoutes);
app.get("/api/auth/me", (req, res) => res.json({ user: safeUser(req.user) }));
app.post(
  "/api/auth/logout",
  wrap(async (req, res) => {
    await getSql()`DELETE FROM mc_sessions WHERE token=${req.sessionHash}`;
    res.clearCookie("mc_session", { path: "/" });
    res.json({ ok: true });
  }),
);
const patient = (req, res, next) =>
  req.user.role === "patient"
    ? next()
    : next(fail(403, "Only patients can manage personal records."));
const doctor = (req, res, next) =>
  req.user.role === "doctor"
    ? next()
    : next(fail(403, "A doctor account is required."));
const metadata =
  "id, title, category, record_date, filename, mime, size, created_at";
async function audit(owner, actor, action) {
  await getSql()`INSERT INTO mc_audit(owner_id,actor,action) VALUES (${owner},${actor},${action})`;
}
app.get(
  "/api/records",
  patient,
  wrap(async (req, res) => {
    const records = await getSql().query(
      `SELECT ${metadata} FROM mc_records WHERE owner_id=$1 ORDER BY record_date DESC,created_at DESC`,
      [req.user.id],
    );
    res.json({ records });
  }),
);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 3, fieldSize: 1000 },
});
app.post(
  "/api/records",
  patient,
  upload.single("file"),
  wrap(async (req, res) => {
    const { title, category, recordDate } = req.body;
    const file = req.file;
    if (!file || !file.size) throw fail(400, "Choose a file to upload.");
    const mime = fileType(file.buffer);
    if (!mime) throw fail(400, "Only PDF, PNG and JPEG documents are allowed.");
    if (
      typeof title !== "string" ||
      title.trim().length < 2 ||
      title.length > 120
    )
      throw fail(400, "Enter a document title between 2 and 120 characters.");
    if (
      ![
        "Lab report",
        "Prescription",
        "Imaging",
        "Discharge summary",
        "Other",
      ].includes(category)
    )
      throw fail(400, "Choose a document category.");
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(recordDate || "") ||
      isNaN(Date.parse(recordDate)) ||
      new Date(recordDate).toISOString().slice(0, 10) !== recordDate ||
      recordDate > new Date().toISOString().slice(0, 10) ||
      recordDate < "1900-01-01"
    )
      throw fail(400, "Choose a valid date that is not in the future.");
    await limit(`upload:${req.user.id}`, 25);
    const q = getSql();
    const filename =
      path
        .basename(file.originalname)
        .replace(/[^a-zA-Z0-9._ -]/g, "_")
        .slice(0, 120) || "document";
    // Serialize uploads per patient before taking the count snapshot.
    const [, records] = await q.transaction([
      q`SELECT id FROM mc_users WHERE id=${req.user.id} FOR UPDATE`,
      q.query(
        `INSERT INTO mc_records(id,owner_id,title,category,record_date,filename,mime,size,content) SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9 WHERE (SELECT count(*) FROM mc_records WHERE owner_id=$2) < 30 RETURNING ${metadata}`,
        [
          randomUUID(),
          req.user.id,
          title.trim(),
          category,
          recordDate,
          filename,
          mime,
          file.size,
          file.buffer.toString("base64"),
        ],
      ),
    ], { isolationLevel: "ReadCommitted" });
    const [record] = records;
    if (!record) throw fail(400, "This showcase supports 30 documents per patient. Remove a document before adding another.");
    await audit(req.user.id, req.user.name, `Uploaded ${title.trim()}`);
    res.status(201).json({ record });
  }),
);
// List and bytes use the same scope predicate; every read checks live consent.
const scopePredicate = `EXISTS (SELECT 1 FROM mc_grants g WHERE g.patient_id=r.owner_id AND g.doctor_id=$2 AND g.expires_at>now() AND (g.record_ids IS NULL OR g.record_ids ? r.id::text))`;
for (const mode of ["preview", "download"]) app.get(
  `/api/records/:id/${mode}`,
  wrap(async (req, res) => {
    if (!uuid(req.params.id)) throw fail(404, "Document not found.");
    const [r] = await getSql().query(`SELECT r.* FROM mc_records r WHERE r.id=$1 AND (r.owner_id=$2 OR ($3='doctor' AND ${scopePredicate}))`, [req.params.id,req.user.id,req.user.role]);
    if (!r) throw fail(404, "Document not found or access has expired.");
    await audit(r.owner_id, req.user.name, `${mode === "preview" ? "Previewed" : "Downloaded"} ${r.title}`);
    res.type(r.mime);
    if (mode === "preview") {
      // Permit the authenticated same-origin preview while blocking other sites.
      res.set("Content-Security-Policy", "default-src 'none'; frame-ancestors 'self'");
      res.set("X-Frame-Options", "SAMEORIGIN");
    }
    res.set("Content-Disposition", `${mode === "preview" ? "inline" : "attachment"}; filename="${r.filename.replace(/["\\\r\n]/g, "_")}"`);
    res.send(Buffer.from(r.content, "base64"));
  }),
);
app.patch("/api/records/:id", patient, wrap(async (req,res) => {
  const { validateRecord } = require("./validation");
  const error = validateRecord(req.body);
  if (error) throw fail(400,error);
  if (!uuid(req.params.id)) throw fail(404,"Document not found.");
  const {title,category,recordDate} = req.body;
  const [record] = await getSql().query(`UPDATE mc_records SET title=$1,category=$2,record_date=$3 WHERE id=$4 AND owner_id=$5 RETURNING ${metadata}`, [title.trim(),category,recordDate,req.params.id,req.user.id]);
  if (!record) throw fail(404,"Document not found.");
  await audit(req.user.id,req.user.name,`Updated ${record.title}`);
  res.json({record});
}));
app.delete(
  "/api/records/:id",
  patient,
  wrap(async (req, res) => {
    if (!uuid(req.params.id)) throw fail(404, "Document not found.");
    const [r] =
      await getSql()`DELETE FROM mc_records WHERE id=${req.params.id} AND owner_id=${req.user.id} RETURNING title`;
    if (!r) throw fail(404, "Document not found.");
    await audit(req.user.id, req.user.name, `Deleted ${r.title}`);
    res.json({ ok: true });
  }),
);
app.use("/api", require("./sharing")({wrap,fail,limit,patient,doctor,audit,uuid,metadata}));
app.get(
  "/api/activity",
  patient,
  wrap(async (req, res) => {
    res.json({
      activity:
        await getSql()`SELECT id,actor,action,created_at FROM mc_audit WHERE owner_id=${req.user.id} ORDER BY created_at DESC LIMIT 30`,
    });
  }),
);
app.use("/api", (req, res) =>
  res.status(404).json({ message: "Endpoint not found." }),
);
app.use(express.static(path.join(__dirname, "../front-end/build")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../front-end/build/index.html")),
);
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  let status = err.status || 500,
    message = err.status
      ? err.message
      : "Something went wrong. Please try again.";
  if (err.code === "23505") {
    status = 409;
    message = "An account with that email already exists. Please sign in.";
  }
  if (err instanceof multer.MulterError) {
    status = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "The file exceeds the 2 MB limit."
        : "Invalid upload. Choose one file and try again.";
  }
  if (err.message === "DATABASE_NOT_CONFIGURED") {
    status = 503;
    message = "The service is being configured. Please try again later.";
  }
  if (status >= 500) console.error("Request failed", err.code || err.name);
  res.status(status).json({ message });
});
if (require.main === module)
  app.listen(process.env.PORT || 4000, () => console.log("MediConnect ready"));
module.exports = app;
