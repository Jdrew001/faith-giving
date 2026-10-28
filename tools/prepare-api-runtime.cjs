#!/usr/bin/env node
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

// Update the version and both checksums together from nodejs.org release files.
const NODE_VERSION = '24.22.1';
const ARCHIVES = {
  x64: 'eb6728e77c576a35162c122c45ccadf224d89ff00abc8dae46cc2897c6002d7c',
  arm64: '33c37be234ba8bee041961047b19160f4d7d0f164e8e246f78bdd10feff148b3',
};

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 180000,
    ...options,
  }).trim();
}

function nodeVersion(executable, execute = run) {
  return execute(executable, ['-p', 'process.versions.node']);
}

function archiveFor(platform, arch) {
  if (platform !== 'linux' || !ARCHIVES[arch]) {
    throw new Error(`Unsupported API server platform: ${platform}/${arch}`);
  }
  return {
    name: `node-v${NODE_VERSION}-linux-${arch}`,
    checksum: ARCHIVES[arch],
  };
}

function verifyChecksum(file, expected) {
  const actual = crypto
    .createHash('sha256')
    .update(fs.readFileSync(file))
    .digest('hex');
  if (actual !== expected)
    throw new Error(
      'Node archive checksum did not match; runtime was not changed.'
    );
}

function runtimeMatches(directory, execute = run) {
  try {
    return (
      nodeVersion(path.join(directory, 'bin/node'), execute) === NODE_VERSION &&
      !!execute(path.join(directory, 'bin/npm'), ['--version'], {
        env: { ...process.env, PATH: `${directory}/bin:${process.env.PATH}` },
      })
    );
  } catch {
    return false;
  }
}

function provisionRuntime(
  shared,
  execute = run,
  platform = process.platform,
  arch = process.arch
) {
  const archive = archiveFor(platform, arch);
  const runtime = path.join(shared, 'runtime');
  if (runtimeMatches(runtime, execute)) return runtime;
  const releases = path.join(shared, 'runtimes');
  fs.mkdirSync(releases, { recursive: true });
  const release = path.join(releases, archive.name);
  if (!runtimeMatches(release, execute)) {
    const staging = fs.mkdtempSync(path.join(releases, '.install-'));
    try {
      const filename = `${archive.name}.tar.gz`;
      const download = path.join(staging, filename);
      execute('curl', [
        '--fail',
        '--silent',
        '--show-error',
        '--location',
        '--proto',
        '=https',
        '--tlsv1.2',
        '--connect-timeout',
        '15',
        '--max-time',
        '120',
        '--retry',
        '2',
        '--output',
        download,
        `https://nodejs.org/dist/v${NODE_VERSION}/${filename}`,
      ]);
      verifyChecksum(download, archive.checksum);
      execute('tar', ['-xzf', download, '-C', staging]);
      const extracted = path.join(staging, archive.name);
      if (!runtimeMatches(extracted, execute))
        throw new Error('Downloaded Node/npm failed runtime validation.');
      if (fs.existsSync(release))
        fs.renameSync(release, `${release}.backup-${Date.now()}`);
      fs.renameSync(extracted, release);
    } finally {
      fs.rmSync(staging, { recursive: true, force: true });
    }
  }
  const next = path.join(shared, `.runtime-${process.pid}`);
  fs.symlinkSync(release, next);
  try {
    if (fs.existsSync(runtime) && !fs.lstatSync(runtime).isSymbolicLink()) {
      fs.renameSync(runtime, `${runtime}.backup-${Date.now()}`);
    }
    fs.renameSync(next, runtime);
  } finally {
    fs.rmSync(next, { force: true });
  }
  return runtime;
}

function assertApiProcesses(processes) {
  const others = processes.filter((app) => app.name !== 'faith-giving-api');
  if (others.length) {
    throw new Error(
      `PM2 also manages ${[...new Set(others.map((app) => app.name))].join(
        ', '
      )}; refusing to restart unrelated applications.`
    );
  }
}

function daemonExecutable(pm2Home) {
  const pidFile = path.join(pm2Home, 'pm2.pid');
  if (!fs.existsSync(pidFile)) return null;
  const pid = fs.readFileSync(pidFile, 'utf8').trim();
  if (!/^[1-9][0-9]*$/.test(pid)) throw new Error('Invalid PM2 daemon PID.');
  try {
    return fs.readlinkSync(`/proc/${pid}/exe`);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function systemdCommand(value) {
  // Quote systemd arguments and escape its percent specifier syntax.
  if (/[\n\r\0]/.test(value)) throw new Error('Invalid service path.');
  return `"${value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/%/g, '%%')}"`;
}

function startupOverride(runtime, pm2Cli, pm2Home) {
  const command = [path.join(runtime, 'bin/node'), pm2Cli]
    .map(systemdCommand)
    .join(' ');
  return `[Service]\nEnvironment=${systemdCommand(
    `PATH=${runtime}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`
  )}\nEnvironment=${systemdCommand(
    `PM2_HOME=${pm2Home}`
  )}\nExecStart=\nExecStart=${command} resurrect\nExecReload=\nExecReload=${command} reload all\nExecStop=\nExecStop=${command} kill\n`;
}

function verifyApiHealth(execute = run) {
  for (let attempt = 0; attempt < 12; attempt++) {
    try {
      execute('curl', [
        '--fail',
        '--silent',
        '--show-error',
        '--max-time',
        '5',
        'http://127.0.0.1:3000/api',
      ]);
      return;
    } catch (error) {
      if (attempt === 11)
        throw new Error(
          'Faith Giving API did not recover after its runtime restart.'
        );
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    }
  }
}

function preparePm2(shared, execute = run) {
  const runtime = path.join(shared, 'runtime');
  if (!runtimeMatches(runtime, execute))
    throw new Error('Provision the pinned API runtime first.');
  const pm2Home = process.env.PM2_HOME || path.join(os.homedir(), '.pm2');
  const pm2Cli = fs.realpathSync(execute('which', ['pm2']));
  const executable = path.join(runtime, 'bin/node');
  const env = {
    ...process.env,
    PM2_HOME: pm2Home,
    PATH: `${runtime}/bin:${process.env.PATH}`,
  };
  const pm2 = (...args) => execute(executable, [pm2Cli, ...args], { env });
  const current = daemonExecutable(pm2Home);
  const processes = current ? JSON.parse(pm2('jlist')) : [];
  assertApiProcesses(processes);
  const dump = path.join(pm2Home, 'dump.pm2');
  if (fs.existsSync(dump))
    assertApiProcesses(JSON.parse(fs.readFileSync(dump, 'utf8')));

  const service = `pm2-${os.userInfo().username}.service`;
  // An existing boot service is required; never silently install into another manager.
  if (
    !execute('systemctl', [
      'show',
      service,
      '--property=FragmentPath',
      '--value',
    ])
  ) {
    throw new Error(
      `Missing ${service}; configure the API PM2 boot service before deployment.`
    );
  }
  const overrideDirectory = `/etc/systemd/system/${service}.d`;
  const overrideFile = path.join(
    overrideDirectory,
    'faith-giving-runtime.conf'
  );
  const desired = startupOverride(runtime, pm2Cli, pm2Home);
  const previous = fs.existsSync(overrideFile)
    ? fs.readFileSync(overrideFile, 'utf8')
    : null;
  const needsRestart =
    current && nodeVersion(current, execute) !== NODE_VERSION;
  if (previous === desired && !needsRestart) {
    execute('systemctl', ['is-enabled', service]);
    return;
  }

  execute('sudo', ['-n', 'true']);
  const backup = fs.mkdtempSync(path.join(shared, 'pm2-runtime-backup-'));
  fs.chmodSync(backup, 0o700);
  const candidate = path.join(backup, 'faith-giving-runtime.conf');
  fs.writeFileSync(candidate, desired, { mode: 0o600 });
  if (previous !== null)
    fs.writeFileSync(path.join(backup, 'previous.conf'), previous, {
      mode: 0o600,
    });
  if (current) pm2('save', '--force');
  if (fs.existsSync(dump)) fs.copyFileSync(dump, path.join(backup, 'dump.pm2'));

  try {
    execute('sudo', ['-n', 'mkdir', '-p', overrideDirectory]);
    execute('sudo', ['-n', 'install', '-m', '644', candidate, overrideFile]);
    execute('sudo', ['-n', 'systemctl', 'daemon-reload']);
    execute('sudo', ['-n', 'systemctl', 'enable', service]);
    if (needsRestart) {
      const active = execute('systemctl', [
        'show',
        service,
        '--property=ActiveState',
        '--value',
      ]);
      if (active !== 'active') pm2('kill');
      execute('sudo', ['-n', 'systemctl', 'restart', service]);
      const updated = daemonExecutable(pm2Home);
      if (!updated || nodeVersion(updated, execute) !== NODE_VERSION) {
        throw new Error('PM2 did not adopt the pinned API Node runtime.');
      }
      if (processes.length) verifyApiHealth(execute);
    }
    console.log(
      `PM2 boot configuration uses Node ${NODE_VERSION}; backup: ${backup}`
    );
  } catch (error) {
    if (previous === null) execute('sudo', ['-n', 'rm', '-f', overrideFile]);
    else
      execute('sudo', [
        '-n',
        'install',
        '-m',
        '644',
        path.join(backup, 'previous.conf'),
        overrideFile,
      ]);
    execute('sudo', ['-n', 'systemctl', 'daemon-reload']);
    if (needsRestart && current) {
      execute('sudo', ['-n', 'systemctl', 'restart', service]);
    }
    throw error;
  }
}

if (require.main === module) {
  const shared = path.join(os.homedir(), 'apps/faith-giving-api/shared');
  try {
    fs.mkdirSync(shared, { recursive: true });
    if (process.argv[2] === '--pm2') preparePm2(shared);
    else if (process.argv.length === 2) {
      const runtime = provisionRuntime(shared);
      console.log(
        `Faith Giving API runtime: Node ${NODE_VERSION} (${runtime}/bin/node)`
      );
    } else throw new Error('Usage: node prepare-api-runtime.cjs [--pm2]');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  NODE_VERSION,
  archiveFor,
  verifyChecksum,
  runtimeMatches,
  provisionRuntime,
  assertApiProcesses,
  startupOverride,
};
