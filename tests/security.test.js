const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  hashPassword,
  verifyPassword,
  fileType,
  validateSignup,
  digest,
} = require("../back-end/security");
test("passwords are salted, irreversible and verified correctly", async () => {
  const a = await hashPassword("test-password-123");
  const b = await hashPassword("test-password-123");
  assert.notEqual(a, b);
  assert(!a.includes("test-password"));
  assert(await verifyPassword("test-password-123", a));
  assert(!(await verifyPassword("incorrect", a)));
  assert(!(await verifyPassword("test-password-123", "plaintext")));
});
test("only supported file signatures are accepted", () => {
  assert.equal(fileType(Buffer.from("%PDF-1.4")), "application/pdf");
  assert.equal(
    fileType(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    "image/png",
  );
  assert.equal(fileType(Buffer.from([255, 216, 255, 224])), "image/jpeg");
  for (const s of ["<script>alert(1)</script>", "MZfile.exe", "fake.pdf", ""])
    assert.equal(fileType(Buffer.from(s)), null);
});
test("registration validates role, length and data types", () => {
  const u = {
    name: "Test User",
    email: "person@example.test",
    password: "long-password",
    role: "patient",
  };
  assert.equal(validateSignup(u), null);
  for (const v of [
    { role: "admin" },
    { email: { $ne: null } },
    { password: "short" },
    { name: "x" },
    { password: "x".repeat(129) },
    { email: "invalid" },
  ])
    assert.equal(typeof validateSignup({ ...u, ...v }), "string");
});
test("tokens are represented only by deterministic hashes", () => {
  assert.equal(digest("a").length, 64);
  assert.equal(digest("a"), digest("a"));
  assert.notEqual(digest("a"), digest("b"));
});
