import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import {
  createFeatureFlagsConfig,
  writeFeatureFlagsAsset,
} from './write-feature-flags-config.mjs';

const enabledSettings = {
  FAITH_GIVING_FEATURE_FLAGS_ENABLED: 'true',
  FAITH_GIVING_FIREBASE_API_KEY: 'public-browser-key',
  FAITH_GIVING_FIREBASE_PROJECT_ID: 'faith-giving-fixture',
  FAITH_GIVING_FIREBASE_APP_ID: 'web-fixture-app',
};

test('missing or disabled settings keep flags off', () => {
  assert.deepEqual(createFeatureFlagsConfig({}), { enabled: false });
  assert.deepEqual(
    createFeatureFlagsConfig({
      ...enabledSettings,
      FAITH_GIVING_FEATURE_FLAGS_ENABLED: 'false',
    }),
    { enabled: false }
  );
});

test('only the three public Firebase values enter the asset', () => {
  const config = createFeatureFlagsConfig({
    ...enabledSettings,
    FAITH_GIVING_FEATURE_FLAGS_ENABLED: ' TRUE ',
    FAITH_GIVING_FIREBASE_PROJECT_ID: ' faith-giving-fixture ',
    FIREBASE_PRIVATE_KEY: 'private-value-must-stay-out',
    DATABASE_PASSWORD: 'database-value-must-stay-out',
  });
  assert.deepEqual(config, {
    enabled: true,
    firebase: {
      apiKey: 'public-browser-key',
      projectId: 'faith-giving-fixture',
      appId: 'web-fixture-app',
    },
  });
});

test('each required enabled setting fails validation without echoing values', () => {
  for (const name of [
    'FAITH_GIVING_FIREBASE_API_KEY',
    'FAITH_GIVING_FIREBASE_PROJECT_ID',
    'FAITH_GIVING_FIREBASE_APP_ID',
  ]) {
    assert.throws(
      () => createFeatureFlagsConfig({ ...enabledSettings, [name]: ' ' }),
      { message: `${name} is required when feature flags are enabled.` }
    );
  }
  assert.throws(
    () =>
      createFeatureFlagsConfig({
        FAITH_GIVING_FEATURE_FLAGS_ENABLED: 'invalid-private-value',
      }),
    { message: 'FAITH_GIVING_FEATURE_FLAGS_ENABLED must be true or false.' }
  );
});

test('configuration is replaced on each package, including disabling a cached build', (context) => {
  const directory = mkdtempSync(join(tmpdir(), 'faith-giving-flags-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const path = join(directory, 'assets', 'feature-flags.json');
  const settings = {
    ...enabledSettings,
    FAITH_GIVING_FIREBASE_API_KEY: 'key-with-"quote\\slash',
  };

  writeFeatureFlagsAsset(settings, path);
  assert.equal(
    JSON.parse(readFileSync(path, 'utf8')).firebase.apiKey,
    settings.FAITH_GIVING_FIREBASE_API_KEY
  );
  writeFeatureFlagsAsset({}, path);
  assert.deepEqual(JSON.parse(readFileSync(path, 'utf8')), { enabled: false });
  assert.throws(() =>
    writeFeatureFlagsAsset(
      { FAITH_GIVING_FEATURE_FLAGS_ENABLED: 'invalid' },
      path
    )
  );
  assert.deepEqual(JSON.parse(readFileSync(path, 'utf8')), { enabled: false });
});
