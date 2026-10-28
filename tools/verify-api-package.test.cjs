const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  verifyManifest,
  verifyInstalledPackage,
} = require('./verify-api-package.cjs');

function fixture(t) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'faith-giving-package-')
  );
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const manifest = {
    dependencies: { pg: '^8.11.0', dotenv: '^16.3.1', typeorm: '0.3.28' },
  };
  const lock = {
    lockfileVersion: 3,
    packages: { '': { dependencies: { ...manifest.dependencies } } },
  };
  for (const name of Object.keys(manifest.dependencies)) {
    lock.packages['node_modules/' + name] = {
      version: manifest.dependencies[name].replace('^', ''),
    };
  }
  const write = () => {
    fs.writeFileSync(
      path.join(directory, 'package.json'),
      JSON.stringify(manifest)
    );
    fs.writeFileSync(
      path.join(directory, 'package-lock.json'),
      JSON.stringify(lock)
    );
  };
  write();
  return { directory, manifest, lock, write };
}

test('accepts a manifest and lock that explicitly install all migration dependencies', (t) => {
  verifyManifest(fixture(t).directory);
});

test('rejects the generated package that omitted the dynamic PostgreSQL driver', (t) => {
  const f = fixture(t);
  delete f.manifest.dependencies.pg;
  delete f.lock.packages[''].dependencies.pg;
  delete f.lock.packages['node_modules/pg'];
  f.write();
  assert.throws(() => verifyManifest(f.directory), /explicitly include pg/);
});

test('requires dotenv as a direct runtime dependency even when another package brings it in', (t) => {
  const f = fixture(t);
  delete f.manifest.dependencies.dotenv;
  f.write();
  assert.throws(() => verifyManifest(f.directory), /explicitly include dotenv/);
});

test('rejects required dependencies that a production install would omit', (t) => {
  const f = fixture(t);
  f.lock.packages['node_modules/pg'].dev = true;
  f.write();
  assert.throws(() => verifyManifest(f.directory), /install pg in production/);
});

test('rejects an out-of-date package lock', (t) => {
  const f = fixture(t);
  f.lock.packages[''].dependencies.pg = '^7.0.0';
  f.write();
  assert.throws(() => verifyManifest(f.directory), /lockfile does not match/);
});

test('manifest checks do not require installed dependencies, while runtime checks do', (t) => {
  const f = fixture(t);
  verifyManifest(f.directory);
  assert.throws(
    () => verifyInstalledPackage(f.directory),
    /Cannot find module/
  );
});
