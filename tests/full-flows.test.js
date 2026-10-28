const {test} = require('node:test');
const {execFile} = require('node:child_process');
const {promisify} = require('node:util');
const path = require('node:path');
const connectionString = process.env.TEST_DATABASE_URL;
test('patient, doctor, consent and account HTTP flows', {skip:!connectionString,timeout:240000}, async () => {
  const savedVercel = process.env.VERCEL;
  // The HTTP suites check the deployment's Secure cookie contract explicitly.
  process.env.VERCEL = '1';
  const fixture = await require('./support/isolated-app')(connectionString);
  const server = fixture.app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  try {
    for (const script of ['e2e-api.js','consent-e2e.js']) {
      try {
        const {stdout,stderr} = await promisify(execFile)(process.execPath,[path.join(__dirname,script)],{
          env:{...process.env, BASE_URL:`http://127.0.0.1:${server.address().port}`,TEST_ACCESS_COOKIE:''},
          timeout:180000,
        });
        console.log(stdout.trim());
        if(stderr) console.error(stderr.trim());
      } catch (e) {
        console.error(e.stdout || '',e.stderr || ''); throw e;
      }
    }
  } finally {
    await new Promise(resolve=>server.close(resolve));
    await fixture.close();
    if(savedVercel === undefined) delete process.env.VERCEL; else process.env.VERCEL = savedVercel;
  }
});
