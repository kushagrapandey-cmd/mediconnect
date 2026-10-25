const { neon } = require("@neondatabase/serverless");
let sql, initialized;
function getSql() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED");
  return (sql ||= neon(process.env.DATABASE_URL));
}
async function init() {
  if (!initialized)
    initialized = (async () => {
      const q = getSql();
      await q`CREATE TABLE IF NOT EXISTS mc_users (id UUID PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('patient','doctor')), code TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ DEFAULT now())`;
      await q`CREATE TABLE IF NOT EXISTS mc_sessions (token TEXT PRIMARY KEY, user_id UUID REFERENCES mc_users(id) ON DELETE CASCADE, expires_at TIMESTAMPTZ NOT NULL)`;
      await q`CREATE TABLE IF NOT EXISTS mc_records (id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES mc_users(id) ON DELETE CASCADE, title TEXT NOT NULL, category TEXT NOT NULL, record_date DATE NOT NULL, filename TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`;
      await q`CREATE TABLE IF NOT EXISTS mc_grants (patient_id UUID REFERENCES mc_users(id) ON DELETE CASCADE, doctor_id UUID REFERENCES mc_users(id) ON DELETE CASCADE, expires_at TIMESTAMPTZ NOT NULL, PRIMARY KEY(patient_id,doctor_id))`;
      await q`CREATE TABLE IF NOT EXISTS mc_audit (id BIGSERIAL PRIMARY KEY, owner_id UUID REFERENCES mc_users(id) ON DELETE CASCADE, actor TEXT NOT NULL, action TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`;
      await q`CREATE TABLE IF NOT EXISTS mc_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at TIMESTAMPTZ NOT NULL)`;
    })().catch((e) => {
      initialized = null;
      throw e;
    });
  return initialized;
}
module.exports = { getSql, init };
