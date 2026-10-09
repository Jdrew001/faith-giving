import { defineFeatures, EvaluationContext } from '@feature-gates/core';
import { FirebaseOptions } from 'firebase/app';

export const FEATURE_FLAGS_TIMEOUT_MS = 3000;

export const FEATURE_CATALOG = defineFeatures({
  betaAccess: { providerKey: 'beta_access', fallback: false },
});

export type FeatureKey = keyof typeof FEATURE_CATALOG;

export interface FeatureFlagsConfig {
  enabled: boolean;
  firebase?: FirebaseOptions;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function normalizedDonorId(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const id = value.trim();
  return UUID_PATTERN.test(id) ? id.toLowerCase() : null;
}

export function donorContext(
  individual: { id?: unknown } | null
): EvaluationContext {
  return { targetId: normalizedDonorId(individual?.id) ?? 'anonymous' };
}

export function parseFeatureFlagsConfig(value: unknown): FeatureFlagsConfig {
  if (!isRecord(value) || value['enabled'] !== true) return { enabled: false };
  const firebase = value['firebase'];
  if (!isRecord(firebase)) return { enabled: false };

  const required = ['apiKey', 'projectId', 'appId'];
  if (required.some((key) => !isNonemptyString(firebase[key])))
    return { enabled: false };

  const optional = ['authDomain', 'messagingSenderId'];
  if (
    optional.some(
      (key) => firebase[key] !== undefined && !isNonemptyString(firebase[key])
    )
  ) {
    return { enabled: false };
  }

  const options: FirebaseOptions = {};
  for (const key of [...required, ...optional]) {
    if (firebase[key] !== undefined)
      options[key] = (firebase[key] as string).trim();
  }
  return { enabled: true, firebase: options };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
