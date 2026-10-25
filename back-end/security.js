const {
  randomBytes,
  scrypt: scryptCallback,
  timingSafeEqual,
  createHash,
} = require("node:crypto");
const { promisify } = require("node:util");
const scrypt = promisify(scryptCallback);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${(await scrypt(password, salt, 64)).toString("hex")}`;
}
async function verifyPassword(password, stored) {
  const [salt, hash] = (stored || "").split(":");
  if (!salt || !hash || !/^[a-f0-9]{128}$/.test(hash)) return false;
  return timingSafeEqual(
    await scrypt(password, salt, 64),
    Buffer.from(hash, "hex"),
  );
}
const digest = (value) => createHash("sha256").update(value).digest("hex");
function fileType(buffer) {
  if (buffer.subarray(0, 5).toString() === "%PDF-") return "application/pdf";
  if (
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return "image/png";
  if (buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255)
    return "image/jpeg";
  return null;
}
function validateSignup(body) {
  const { name, email, password, role } = body;
  if (typeof name !== "string" || name.trim().length < 2 || name.length > 80)
    return "Enter a name between 2 and 80 characters.";
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
    return "Enter a valid email address.";
  if (
    typeof password !== "string" ||
    password.length < 10 ||
    password.length > 128
  )
    return "Use a password between 10 and 128 characters.";
  if (!["patient", "doctor"].includes(role))
    return "Choose a valid account type.";
  return null;
}
module.exports = {
  hashPassword,
  verifyPassword,
  digest,
  fileType,
  validateSignup,
};
