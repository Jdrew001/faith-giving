#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const MIGRATION_DEPENDENCIES = ['pg', 'dotenv', 'typeorm'];

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function verifyManifest(directory) {
  const manifest = readJson(path.join(directory, 'package.json'));
  const lock = readJson(path.join(directory, 'package-lock.json'));
  for (const name of MIGRATION_DEPENDENCIES) {
    if (!manifest.dependencies?.[name]) {
      throw new Error(
        `API production dependencies must explicitly include ${name}.`
      );
    }
    if (
      lock.packages?.['']?.dependencies?.[name] !== manifest.dependencies[name]
    ) {
      throw new Error(
        `Packaged lockfile does not match the ${name} dependency.`
      );
    }
    const installed = lock.packages?.[`node_modules/${name}`];
    if (!installed || installed.dev === true) {
      throw new Error(`Packaged lockfile must install ${name} in production.`);
    }
  }
}

function verifyInstalledPackage(directory) {
  verifyManifest(directory);
  const load = createRequire(path.join(directory, 'package.json'));
  const modules = path.join(directory, 'node_modules') + path.sep;
  for (const name of MIGRATION_DEPENDENCIES) {
    if (!load.resolve(name).startsWith(modules)) {
      throw new Error(`${name} resolves outside the installed API package.`);
    }
    load(name);
  }
  const exported = load('./migration-data-source.js');
  const source = exported.default ?? exported;
  if (
    source.options?.type !== 'postgres' ||
    typeof source.driver?.postgres?.Pool !== 'function'
  ) {
    throw new Error(
      'Migration data source did not load the PostgreSQL driver.'
    );
  }
  if (source.isInitialized)
    throw new Error('Package validation must not open a database connection.');
}

if (require.main === module) {
  const directory = path.resolve(process.argv[2] || '.');
  try {
    if (process.argv[3] === '--manifest') verifyManifest(directory);
    else verifyInstalledPackage(directory);
    console.log('API migration dependencies verified.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { verifyManifest, verifyInstalledPackage };
