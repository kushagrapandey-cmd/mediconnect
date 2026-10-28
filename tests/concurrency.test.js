// Real PostgreSQL regression tests. Uses a fresh schema, never application data.
// TEST_DATABASE_URL=postgresql://... npm test
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID, randomBytes } = require('node:crypto');

const connectionString = process.env.TEST_DATABASE_URL;
test('account and upload concurrency (isolated PostgreSQL schema)', {skip: !connectionString, timeout: 180000}, async t => {
  const request = require('supertest');
  const fixture = await require('./support/isolated-app')(connectionString);
  const {app,pool,hooks} = fixture;
  const {digest} = require('../back-end/security');
  const oldPassword = 'old-test-password', newPassword = 'new-test-password';
  function gate() {
    let release, reached;
    return {wait: new Promise(r => reached = r), hold: new Promise(r => release = r),
      release: () => release(), reached: () => reached()};
  }
  async function signup() {
    const email = `${randomUUID()}@example.test`;
    const r = await request(app).post('/api/auth/signup').send({name:'Race patient', email, password:oldPassword, role:'patient'});
    assert.equal(r.status, 201, JSON.stringify(r.body));
    return {...r.body, email, cookie:r.headers['set-cookie'][0].split(';')[0]};
  }
  async function prepareEmailReset(user) {
    user.resetToken = randomBytes(32).toString('hex');
    await pool.query("INSERT INTO mc_account_tokens(token,user_id,kind,expires_at) VALUES ($1,$2,'reset',now()+interval '30 minutes')",[digest(user.resetToken),user.user.id]);
  }
  async function reset(user, mode) {
    if (mode === 'key') return request(app).post('/api/auth/recover').send({email:user.email, recoveryKey:user.recoveryKey, password:newPassword});
    if (mode === 'password') return request(app).post('/api/account/password').set('Cookie',user.cookie).send({currentPassword:oldPassword,password:newPassword});
    if (!user.resetToken) await prepareEmailReset(user);
    return request(app).post('/api/auth/complete').send({token:user.resetToken,kind:'reset',password:newPassword});
  }
  try {
    for (const mode of ['key','email','password']) {
      await t.test(`${mode}: recovery completes after login reads old credentials`, async () => {
        const user = await signup(), paused = gate();
        hooks.after = async stmt => {
          if (stmt.text.startsWith('SELECT * FROM mc_users WHERE email=')) {
            hooks.after = async () => {}; paused.reached(); await paused.hold;
          }
        };
        const login = request(app).post('/api/auth/login').send({email:user.email,password:oldPassword}).then(r=>r);
        await paused.wait;
        let changed;
        try {changed = await reset(user,mode);} finally {paused.release();}
        const stale = await login;
        assert.equal(changed.status,200,JSON.stringify(changed.body));
        assert.equal(stale.status,401);
        assert.equal(stale.headers['set-cookie'],undefined);
        assert.equal((await pool.query('SELECT * FROM mc_sessions WHERE user_id=$1',[user.user.id])).rowCount,0);
        assert.equal((await request(app).get('/api/auth/me').set('Cookie',user.cookie)).status,401);
        const fresh = await request(app).post('/api/auth/login').send({email:user.email,password:newPassword});
        assert.equal(fresh.status,200);
        assert.equal((await request(app).get('/api/auth/me').set('Cookie',fresh.headers['set-cookie'][0].split(';')[0])).status,200);
      });
    }
    for (const mode of ['key','email','password']) {
      await t.test(`${mode}: revocation waits for a login that already inserted its session`, async () => {
        const user = await signup(), inserted = gate(), waiting = gate();
        // Seed the reset token before holding the user lock: its foreign-key
        // check also takes a row lock, which would otherwise deadlock the test.
        if (mode === 'email') await prepareEmailReset(user);
        hooks.after = async stmt => {
          if(stmt.text.startsWith('INSERT INTO mc_sessions')) {
            hooks.after = async () => {}; inserted.reached(); await inserted.hold;
          }
        };
        const login = request(app).post('/api/auth/login').send({email:user.email,password:oldPassword}).then(r=>r);
        await inserted.wait;
        hooks.before = async stmt => {
          if(stmt.text.includes('FOR UPDATE') || stmt.text.startsWith('WITH changed AS') || stmt.text.startsWith('WITH used AS')) waiting.reached();
        };
        const recovery = reset(user,mode);
        // reset is async and returns a thenable request; start it immediately.
        const changed = Promise.resolve(recovery);
        await waiting.wait;
        inserted.release();
        const [signedIn, recovered] = await Promise.all([login,changed]);
        hooks.before = async () => {};
        assert.equal(signedIn.status,200);
        assert.equal(recovered.status,200,JSON.stringify(recovered.body));
        assert.equal((await request(app).get('/api/auth/me').set('Cookie',signedIn.headers['set-cookie'][0].split(';')[0])).status,401);
        assert.equal((await pool.query('SELECT * FROM mc_sessions WHERE user_id=$1',[user.user.id])).rowCount,0);
      });
    }
    await t.test('stale recovery-key rotation cannot replace a recovered account key', async () => {
      const user = await signup(), paused = gate();
      hooks.before = async stmt => {
        if (stmt.text.startsWith('UPDATE mc_users SET recovery_hash=')) {
          hooks.before = async()=>{}; paused.reached(); await paused.hold;
        }
      };
      const rotation = request(app).post('/api/account/recovery-key').set('Cookie',user.cookie)
        .send({password:oldPassword}).then(r=>r);
      await paused.wait;
      let recovered;
      try {recovered = await reset(user,'key');} finally {paused.release();}
      const stale = await rotation;
      assert.equal(recovered.status,200);
      assert.equal(stale.status,409);
      assert.equal(stale.body.recoveryKey,undefined);
      const {rows} = await pool.query('SELECT recovery_hash FROM mc_users WHERE id=$1',[user.user.id]);
      assert.equal(rows[0].recovery_hash,digest(recovered.body.recoveryKey));
    });
    await t.test('two uploads compete for the final slot, deletion makes capacity available', async () => {
      const user = await signup();
      await pool.query(`INSERT INTO mc_records(id,owner_id,title,category,record_date,filename,mime,size,content)
        SELECT gen_random_uuid(),$1,'Seed','Other','2026-01-01','seed.pdf','application/pdf',5,'JVBERi0=' FROM generate_series(1,29)`,[user.user.id]);
      const start = gate(); let arrivals = 0;
      hooks.before = async stmt => {
        if(stmt.text.includes('FOR UPDATE') && stmt.values.includes(user.user.id)) {
          if(++arrivals === 2) start.release();
          await start.hold;
        }
      };
      // Also coordinate the vulnerable implementation, so this test detects its
      // separate count/insert race when run against the parent revision.
      hooks.after = async stmt => {
        if(stmt.text.startsWith('SELECT count(*) FROM mc_records')) {
          if(++arrivals === 2) start.release();
          await start.hold;
        }
      };
      function upload() {
        return request(app).post('/api/records').set('Cookie',user.cookie)
          .field('title','Race report').field('category','Other').field('recordDate','2026-01-01')
          .attach('file',Buffer.from('%PDF-1.4\nSynthetic only\n%%EOF'),'report.pdf');
      }
      const responses = await Promise.all([upload(), upload()]);
      hooks.before = hooks.after = async () => {};
      assert.deepEqual(responses.map(r=>r.status).sort(),[201,400]);
      assert.equal((await pool.query('SELECT count(*)::int AS count FROM mc_records WHERE owner_id=$1',[user.user.id])).rows[0].count,30);
      assert.equal((await upload()).status,400);
      const record = responses.find(r=>r.status===201).body.record;
      assert.equal((await request(app).delete(`/api/records/${record.id}`).set('Cookie',user.cookie)).status,200);
      assert.equal((await upload()).status,201);
      assert.equal((await request(app).get('/api/records').set('Cookie',user.cookie)).body.records.length,30);
    });
  } finally {
    await fixture.close();
  }
});
