const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {
  NODE_VERSION,
  archiveFor,
  verifyChecksum,
  runtimeMatches,
  provisionRuntime,
  assertApiProcesses,
  startupOverride,
} = require('./prepare-api-runtime.cjs');

function temporaryDirectory(t) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'faith-giving-runtime-')
  );
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function installedRuntime(directory) {
  fs.mkdirSync(path.join(directory, 'bin'), { recursive: true });
  fs.writeFileSync(path.join(directory, 'bin/node'), 'node');
  fs.writeFileSync(path.join(directory, 'bin/npm'), 'npm');
}

function installedCommands(command) {
  if (!fs.existsSync(command)) throw new Error('Missing executable');
  if (command.endsWith('/bin/node')) return NODE_VERSION;
  if (command.endsWith('/bin/npm')) return '11.6.2';
  throw new Error(`Unexpected command: ${command}`);
}

test('selects pinned official Linux archives and rejects unsupported hosts', () => {
  for (const arch of ['x64', 'arm64']) {
    assert.equal(
      archiveFor('linux', arch).name,
      `node-v${NODE_VERSION}-linux-${arch}`
    );
    assert.match(archiveFor('linux', arch).checksum, /^[a-f0-9]{64}$/);
  }
  assert.throws(() => archiveFor('darwin', 'x64'), /Unsupported/);
  assert.throws(() => archiveFor('linux', 'ia32'), /Unsupported/);
});

test('verifies the exact downloaded bytes before extraction', (t) => {
  const file = path.join(temporaryDirectory(t), 'node.tar.gz');
  fs.writeFileSync(file, 'fixture archive');
  const checksum = crypto
    .createHash('sha256')
    .update('fixture archive')
    .digest('hex');
  verifyChecksum(file, checksum);
  fs.appendFileSync(file, 'tampered');
  assert.throws(() => verifyChecksum(file, checksum), /checksum did not match/);
});

test('reuses a healthy pinned runtime without network or service commands', (t) => {
  const shared = temporaryDirectory(t);
  installedRuntime(path.join(shared, 'runtime'));
  const expected = path.join(shared, 'runtime');
  assert.equal(
    provisionRuntime(shared, installedCommands, 'linux', 'x64'),
    expected
  );
  assert.equal(
    provisionRuntime(shared, installedCommands, 'linux', 'x64'),
    expected
  );
  assert.equal(fs.existsSync(path.join(shared, 'runtimes')), false);
});

test('promotes an already verified cached runtime and preserves the prior directory', (t) => {
  const shared = temporaryDirectory(t);
  const release = path.join(
    shared,
    'runtimes',
    archiveFor('linux', 'x64').name
  );
  installedRuntime(release);
  fs.mkdirSync(path.join(shared, 'runtime'));
  fs.writeFileSync(path.join(shared, 'runtime/prior-runtime'), 'keep me');
  provisionRuntime(shared, installedCommands, 'linux', 'x64');
  assert.equal(
    fs.realpathSync(path.join(shared, 'runtime')),
    fs.realpathSync(release)
  );
  const backup = fs
    .readdirSync(shared)
    .find((name) => name.startsWith('runtime.backup-'));
  assert.equal(
    fs.readFileSync(path.join(shared, backup, 'prior-runtime'), 'utf8'),
    'keep me'
  );
});

test('a failed checksum never replaces the existing runtime or leaves staging files', (t) => {
  const shared = temporaryDirectory(t);
  fs.mkdirSync(path.join(shared, 'runtime'));
  fs.writeFileSync(path.join(shared, 'runtime/prior-runtime'), 'keep me');
  const execute = (command, args) => {
    if (command !== 'curl') throw new Error('Missing executable');
    fs.writeFileSync(args[args.indexOf('--output') + 1], 'invalid download');
    return '';
  };
  assert.throws(
    () => provisionRuntime(shared, execute, 'linux', 'x64'),
    /checksum/
  );
  assert.equal(
    fs.readFileSync(path.join(shared, 'runtime/prior-runtime'), 'utf8'),
    'keep me'
  );
  assert.deepEqual(fs.readdirSync(path.join(shared, 'runtimes')), []);
});

test('requires working npm as well as the pinned Node version', () => {
  assert.equal(
    runtimeMatches('/fixture', () => NODE_VERSION),
    true
  );
  assert.equal(
    runtimeMatches('/fixture', () => '18.13.0'),
    false
  );
  assert.equal(
    runtimeMatches('/fixture', (command) => {
      if (command.endsWith('/npm')) throw new Error('Broken npm');
      return NODE_VERSION;
    }),
    false
  );
});

test('refuses a daemon or saved process list containing other applications', () => {
  assertApiProcesses([]);
  assertApiProcesses([
    { name: 'faith-giving-api' },
    { name: 'faith-giving-api' },
  ]);
  assert.throws(
    () =>
      assertApiProcesses([{ name: 'faith-giving-api' }, { name: 'other-api' }]),
    /refusing to restart unrelated applications/
  );
});

test('pins all boot service actions to Node and preserves the PM2 process home', () => {
  const config = startupOverride(
    '/home/team city/runtime',
    '/usr/local/pm2/bin/pm2',
    '/home/team city/.pm2'
  );
  for (const action of ['resurrect', 'reload all', 'kill']) {
    assert.ok(
      config.includes(
        `"/home/team city/runtime/bin/node" "/usr/local/pm2/bin/pm2" ${action}`
      )
    );
  }
  assert.ok(config.includes('Environment="PM2_HOME=/home/team city/.pm2"'));
  assert.ok(config.includes('ExecStart=\n'));
  assert.throws(
    () => startupOverride('/bad\npath', '/pm2', '/pm2home'),
    /Invalid service path/
  );
});
