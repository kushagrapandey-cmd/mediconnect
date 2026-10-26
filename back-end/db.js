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
      // One atomic bootstrap round-trip; serialize concurrent cold starts.
      await q.transaction([
        q`SELECT pg_advisory_xact_lock(5890123)`,
        q`CREATE TABLE IF NOT EXISTS mc_users (id UUID PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('patient','doctor')), code TEXT NOT NULL UNIQUE, created_at TIMESTAMPTZ DEFAULT now())`,
        q`CREATE TABLE IF NOT EXISTS mc_sessions (token TEXT PRIMARY KEY, user_id UUID REFERENCES mc_users(id) ON DELETE CASCADE, expires_at TIMESTAMPTZ NOT NULL)`,
        q`CREATE TABLE IF NOT EXISTS mc_records (id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES mc_users(id) ON DELETE CASCADE, title TEXT NOT NULL, category TEXT NOT NULL, record_date DATE NOT NULL, filename TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL, content TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`,
        q`CREATE TABLE IF NOT EXISTS mc_grants (patient_id UUID REFERENCES mc_users(id) ON DELETE CASCADE, doctor_id UUID REFERENCES mc_users(id) ON DELETE CASCADE, expires_at TIMESTAMPTZ NOT NULL, PRIMARY KEY(patient_id,doctor_id))`,
        q`CREATE TABLE IF NOT EXISTS mc_audit (id BIGSERIAL PRIMARY KEY, owner_id UUID REFERENCES mc_users(id) ON DELETE CASCADE, actor TEXT NOT NULL, action TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`,
        q`ALTER TABLE mc_users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false`,
        q`ALTER TABLE mc_users ADD COLUMN IF NOT EXISTS recovery_hash TEXT`,
        q`ALTER TABLE mc_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now()`,
        q`ALTER TABLE mc_sessions ADD COLUMN IF NOT EXISTS device TEXT NOT NULL DEFAULT 'Browser session'`,
        q`ALTER TABLE mc_grants ADD COLUMN IF NOT EXISTS record_ids JSONB`,
        q`CREATE TABLE IF NOT EXISTS mc_access_requests (id UUID PRIMARY KEY, patient_id UUID NOT NULL REFERENCES mc_users(id) ON DELETE CASCADE, doctor_id UUID NOT NULL REFERENCES mc_users(id) ON DELETE CASCADE, purpose TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','denied')), created_at TIMESTAMPTZ NOT NULL DEFAULT now(), expires_at TIMESTAMPTZ NOT NULL DEFAULT now()+interval '7 days', UNIQUE(patient_id,doctor_id))`,
        q`CREATE TABLE IF NOT EXISTS mc_account_tokens (token TEXT PRIMARY KEY, user_id UUID NOT NULL REFERENCES mc_users(id) ON DELETE CASCADE, kind TEXT NOT NULL CHECK(kind IN ('verify','reset')), expires_at TIMESTAMPTZ NOT NULL)`,
        q`CREATE TABLE IF NOT EXISTS mc_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at TIMESTAMPTZ NOT NULL)`,
      ]);
    })().catch((e) => {
      initialized = null;
      throw e;
    });
  return initialized;
}
module.exports = { getSql, init };
