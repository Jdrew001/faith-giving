import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ENABLED_SETTING = 'FAITH_GIVING_FEATURE_FLAGS_ENABLED';
const FIREBASE_SETTINGS = {
  apiKey: 'FAITH_GIVING_FIREBASE_API_KEY',
  projectId: 'FAITH_GIVING_FIREBASE_PROJECT_ID',
  appId: 'FAITH_GIVING_FIREBASE_APP_ID',
};
const ASSET_PATH = fileURLToPath(
  new URL(
    '../dist/apps/faith-giving-ui/assets/feature-flags.json',
    import.meta.url
  )
);

function readDeploymentSetting(environment, name) {
  const value = environment[name];
  return typeof value === 'string' ? value.trim() : '';
}

function flagsEnabled(environment) {
  const value = readDeploymentSetting(
    environment,
    ENABLED_SETTING
  ).toLowerCase();
  if (!value || value === 'false') return false;
  if (value === 'true') return true;
  throw new Error(`${ENABLED_SETTING} must be true or false.`);
}

function firebaseWebConfiguration(environment) {
  const firebase = {};
  for (const [field, name] of Object.entries(FIREBASE_SETTINGS)) {
    const value = readDeploymentSetting(environment, name);
    if (!value)
      throw new Error(`${name} is required when feature flags are enabled.`);
    firebase[field] = value;
  }
  return firebase;
}

export function createFeatureFlagsConfig(environment) {
  if (!flagsEnabled(environment)) return { enabled: false };
  return { enabled: true, firebase: firebaseWebConfiguration(environment) };
}

export function writeFeatureFlagsAsset(environment, path = ASSET_PATH) {
  const config = createFeatureFlagsConfig(environment);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  writeFeatureFlagsAsset(process.env);
  console.log('Feature flag asset generated from deployment settings.');
}
