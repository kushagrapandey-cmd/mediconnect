// Explicit opt-in: creates synthetic accounts on the supplied deployment.
// Run: BASE_URL=https://your-isolated-deployment node tests/e2e-api.js
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const base = process.env.BASE_URL;
if (!base) throw new Error("Set BASE_URL to the isolated deployment to test.");
const stamp = Date.now();
const password = randomBytes(18).toString("hex");
let checks = 0;
function ok(label, fn) {
  fn();
  checks++;
  console.log("PASS", label);
}
class Client {
  cookie = "";
  user = null;
  async request(path, method = "GET", body, headers = {}) {
    const isForm = body instanceof FormData;
    const res = await fetch(base + "/api" + path, {
      method,
      headers: {
        ...(this.cookie ? { cookie: this.cookie } : {}),
        ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      signal: AbortSignal.timeout(30000),
    });
    const cookie = res.headers.get("set-cookie");
    if (cookie) this.cookie = cookie.split(";")[0];
    const bytes = Buffer.from(await res.arrayBuffer());
    let data;
    try {
      data = JSON.parse(bytes.toString());
    } catch {}
    return { status: res.status, data, bytes, headers: res.headers };
  }
  async signup(name, role) {
    const r = await this.request("/auth/signup", "POST", {
      name,
      email: `qa-${role}-${name.replace(/\s/g, "")}-${stamp}@example.test`,
      password,
      role,
    });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    this.user = r.data.user;
    this.email = this.user.email;
    return r;
  }
}
(async () => {
  const guest = new Client(),
    p = new Client(),
    d = new Client(),
    other = new Client();
  let r = await guest.request("/health");
  ok("Database health", () => assert.equal(r.status, 200));
  r = await guest.request("/records");
  ok("Anonymous records blocked", () => assert.equal(r.status, 401));
  r = await guest.request("/auth/signup", "POST", {
    name: "Test",
    email: "bad",
    password: "short",
    role: "admin",
  });
  ok("Invalid registration rejected", () => assert.equal(r.status, 400));
  r = await p.signup("QA Patient", "patient");
  ok("Patient signup hides password", () => {
    assert(!("password" in r.data.user));
    assert.match(p.user.code, /^[A-F0-9]{10}$/);
    assert.match(r.headers.get("set-cookie"), /HttpOnly/i);
    assert.match(r.headers.get("set-cookie"), /Secure/i);
  });
  await d.signup("QA Doctor", "doctor");
  await other.signup("Other Patient", "patient");
  ok("Doctor and second patient register", () =>
    assert.equal(d.user.role, "doctor"),
  );
  r = await p.request("/auth/signup", "POST", {
    name: "Duplicate",
    email: p.email.toUpperCase(),
    password,
    role: "patient",
  });
  ok("Case-insensitive duplicate signup rejected", () =>
    assert.equal(r.status, 409),
  );
  r = await guest.request("/auth/login", "POST", {
    email: p.email,
    password: "incorrect-password",
  });
  ok("Incorrect login rejected", () => assert.equal(r.status, 401));
  r = await guest.request("/auth/login", "POST", {
    email: { $ne: null },
    password: "invalid-password",
  });
  ok("Object-shaped login rejected", () => assert.equal(r.status, 400));
  r = await p.request("/auth/me");
  ok("Session survives independent request", () =>
    assert.equal(r.data.user.id, p.user.id),
  );
  r = await d.request("/records");
  ok("Doctor cannot manage patient records", () => assert.equal(r.status, 403));
  r = await p.request("/patients");
  ok("Patient cannot use doctor endpoint", () => assert.equal(r.status, 403));
  r = await d.request("/patients/" + p.user.code + "/records");
  ok("Knowing patient code gives no access", () => assert.equal(r.status, 404));
  async function upload(
    c,
    title,
    bytes,
    type = "application/pdf",
    recordDate = "2026-01-10",
  ) {
    const f = new FormData();
    f.set("file", new Blob([bytes], { type }), "same-report.pdf");
    f.set("title", title);
    f.set("category", "Lab report");
    f.set("recordDate", recordDate);
    return c.request("/records", "POST", f);
  }
  const bytes1 = Buffer.from("%PDF-1.4\nSynthetic QA document one\n%%EOF");
  const bytes2 = Buffer.from("%PDF-1.4\nSynthetic QA document two\n%%EOF");
  r = await upload(p, "First synthetic report", bytes1);
  ok("Upload and metadata persist", () =>
    assert.equal(r.status, 201, JSON.stringify(r.data)),
  );
  const first = r.data.record;
  r = await upload(p, "Second synthetic report", bytes2);
  ok("Duplicate filenames create distinct IDs", () => {
    assert.equal(r.status, 201);
    assert.notEqual(r.data.record.id, first.id);
  });
  const second = r.data.record;
  r = await p.request("/records");
  ok("Library has both records without file content", () => {
    assert.equal(r.data.records.length, 2);
    assert(!("content" in r.data.records[0]));
  });
  r = await p.request("/records/" + first.id + "/download");
  ok("Owner download returns exact original bytes", () =>
    assert.deepEqual(r.bytes, bytes1),
  );
  r = await p.request("/records/" + second.id + "/download");
  ok("Duplicate filename download returns correct second file", () =>
    assert.deepEqual(r.bytes, bytes2),
  );
  r = await other.request("/records/" + first.id + "/download");
  ok("Other patient download blocked", () => assert.equal(r.status, 404));
  r = await other.request("/records/" + first.id, "DELETE");
  ok("Other patient deletion blocked", () => assert.equal(r.status, 404));
  r = await d.request("/records/" + first.id + "/download");
  ok("Doctor download blocked before consent", () =>
    assert.equal(r.status, 404),
  );
  r = await upload(
    p,
    "Disguised executable",
    Buffer.from("<script>bad</script>"),
  );
  ok("Fake PDF rejected by content signature", () =>
    assert.equal(r.status, 400),
  );
  r = await upload(
    p,
    "Oversized file",
    Buffer.concat([bytes1, Buffer.alloc(2097153)]),
  );
  ok("File size limit enforced", () => assert.equal(r.status, 400));
  r = await upload(p, "Future record", bytes1, "application/pdf", "2099-01-01");
  ok("Future date rejected", () => assert.equal(r.status, 400));
  r = await upload(p, "Invalid date", bytes1, "application/pdf", "2026-02-31");
  ok("Impossible date rejected", () => assert.equal(r.status, 400));
  r = await p.request("/grants", "POST", { code: d.user.code, recordIds: [first.id,second.id], hours: 24 });
  ok("Patient grants doctor access", () =>
    assert.equal(r.status, 201, JSON.stringify(r.data)),
  );
  r = await d.request("/patients");
  ok("Doctor sees consenting patient", () =>
    assert.equal(r.data.patients[0].code, p.user.code),
  );
  r = await d.request("/patients/" + p.user.code + "/records");
  ok("Consented doctor sees both records", () =>
    assert.equal(r.data.records.length, 2),
  );
  r = await d.request("/records/" + first.id + "/download");
  ok("Consented download returns original bytes", () =>
    assert.deepEqual(r.bytes, bytes1),
  );
  r = await d.request("/records/" + first.id, "DELETE");
  ok("Doctor cannot delete even with consent", () =>
    assert.equal(r.status, 403),
  );
  r = await p.request("/grants/" + d.user.code, "DELETE");
  ok("Patient revokes access", () => assert.equal(r.status, 200));
  r = await d.request("/patients/" + p.user.code + "/records");
  ok("Revocation blocks subsequent views", () => assert.equal(r.status, 404));
  r = await d.request("/records/" + first.id + "/download");
  ok("Revocation blocks subsequent downloads", () =>
    assert.equal(r.status, 404),
  );
  r = await p.request("/activity");
  ok("Activity includes doctor access", () =>
    assert(
      r.data.activity.some(
        (x) => x.actor === "QA Doctor" && x.action.includes("Downloaded"),
      ),
    ),
  );
  r = await p.request("/records/" + first.id, "DELETE");
  ok("Owner deletes own document", () => assert.equal(r.status, 200));
  r = await p.request("/records/" + first.id + "/download");
  ok("Deleted record is unavailable", () => assert.equal(r.status, 404));
  await p.request("/records/" + second.id, "DELETE");
  r = await p.request(
    "/grants",
    "POST",
    { code: d.user.code, recordIds: [first.id,second.id], hours: 24 },
    { Origin: "https://unrelated.example" },
  );
  ok("Cross-origin mutation rejected", () => assert.equal(r.status, 403));
  const oldCookie = p.cookie;
  r = await p.request("/auth/logout", "POST");
  ok("Logout succeeds", () => assert.equal(r.status, 200));
  p.cookie = oldCookie;
  r = await p.request("/auth/me");
  ok("Logout invalidates old cookie server-side", () =>
    assert.equal(r.status, 401),
  );
  r = await p.request("/auth/login", "POST", { email: p.email, password });
  ok("Login works after logout", () => assert.equal(r.status, 200));
  r = await p.request("/records");
  ok("Deletion persists across login", () =>
    assert.equal(r.data.records.length, 0),
  );
  await p.request("/auth/logout", "POST");
  await d.request("/auth/logout", "POST");
  await other.request("/auth/logout", "POST");
  console.log(
    `\n${checks} API end-to-end checks passed. Synthetic QA accounts remain; uploaded files were removed.`,
  );
})().catch((e) => {
  console.error("FAIL", e.message);
  process.exitCode = 1;
});
