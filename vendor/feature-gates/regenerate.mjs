import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const vendor = fileURLToPath(new URL('./', import.meta.url));
const source = join(vendor, 'source');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
function run(args) {
  const result = spawnSync(npm, args, { cwd: source, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`npm ${args.join(' ')} failed`);
}
run(['ci']);
run(['run', 'check']);
for (const name of ['core', 'firebase']) {
  run(['pack', '--workspace', `@feature-gates/${name}`, '--pack-destination', vendor]);
}
const files = ['feature-gates-core-0.1.1.tgz', 'feature-gates-firebase-0.1.1.tgz'];
const checksums = files.map(name => `${createHash('sha256').update(readFileSync(join(vendor, name))).digest('hex')}  ${name}`);
writeFileSync(join(vendor, 'SHA256SUMS'), `${checksums.join('\n')}\n`);
