const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
module.exports = async function isolatedApp(connectionString) {
  const { Pool } = require('pg');
  const schema = `mc_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new Pool({connectionString, connectionTimeoutMillis:10000});
  await admin.query(`CREATE SCHEMA ${schema}`);
  const pool = new Pool({connectionString, connectionTimeoutMillis:10000, options: `-c search_path=${schema} -c statement_timeout=10000`});
  const hooks = {before:async()=>{},after:async()=>{}};
  // Preserve Neon's lazy queries and transaction semantics, execute real SQL on
  // independent PostgreSQL connections. No database behavior is mocked.
  function query(text, values = []) {
    return {text, values, then(resolve, reject) {return run(pool, this).then(resolve, reject);}};
  }
  async function run(client, stmt) {
    await hooks.before(stmt);
    const result = await client.query(stmt.text, stmt.values);
    await hooks.after(stmt, result.rows);
    return result.rows;
  }
  function sql(strings, ...values) {
    return query(strings.reduce((text, part, i) => text + (i ? `$${i}` : '') + part, ''), values);
  }
  sql.query = query;
  sql.transaction = async (stmts, options) => {
    const client = await pool.connect();
    try {
      assert.equal(options?.isolationLevel || 'ReadCommitted', 'ReadCommitted');
      await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
      const rows = [];
      for (const stmt of stmts) rows.push(await run(client, stmt));
      await client.query('COMMIT');
      return rows;
    } catch (e) {await client.query('ROLLBACK'); throw e;}
    finally {client.release();}
  };
  const driverPath = require.resolve('@neondatabase/serverless');
  const savedDriver = require.cache[driverPath];
  require.cache[driverPath] = {id: driverPath, filename: driverPath, loaded: true, exports: {neon: () => sql}};
  const savedURL = process.env.DATABASE_URL;
  process.env.DATABASE_URL = connectionString;
  const app = require('../../back-end/server');
  return {app, pool, hooks, async close() {
    hooks.before = hooks.after = async()=>{};
    try { await pool.end(); await admin.query(`DROP SCHEMA ${schema} CASCADE`); }
    finally {
      await admin.end();
      if(savedURL === undefined) delete process.env.DATABASE_URL; else process.env.DATABASE_URL = savedURL;
      if(savedDriver) require.cache[driverPath] = savedDriver; else delete require.cache[driverPath];
    }
  }};
};
