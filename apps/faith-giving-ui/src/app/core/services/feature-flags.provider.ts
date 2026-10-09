import { HttpClient } from '@angular/common/http';
import { InjectionToken } from '@angular/core';
import {
  EvaluationContext,
  FeatureProvider,
  ProviderSession,
} from '@feature-gates/core';
import { createFirebaseProvider } from '@feature-gates/firebase';
import {
  deleteApp,
  FirebaseApp,
  FirebaseOptions,
  getApps,
  initializeApp,
} from 'firebase/app';
import {
  getRemoteConfig,
  isSupported,
  RemoteConfig,
} from 'firebase/remote-config';
import { firstValueFrom, Subject, takeUntil, timeout } from 'rxjs';

import {
  FEATURE_FLAGS_TIMEOUT_MS,
  normalizedDonorId,
  parseFeatureFlagsConfig,
} from './feature-flags.config';

export interface FeatureFlagsRuntime {
  isSupported(): Promise<boolean>;
  createApp(options: FirebaseOptions): FirebaseApp;
  getRemoteConfig(app: FirebaseApp): RemoteConfig;
  createProvider(remoteConfig: RemoteConfig): FeatureProvider;
  deleteApp(app: FirebaseApp): Promise<void>;
}

const APP_NAME = 'faith-giving-feature-flags';

export const FEATURE_FLAGS_RUNTIME = new InjectionToken<FeatureFlagsRuntime>(
  'Feature flags runtime',
  {
    providedIn: 'root',
    factory: () => ({
      isSupported,
      createApp: (options) => {
        if (getApps().some((app) => app.name === APP_NAME)) {
          throw new Error(
            'The feature flags Firebase app is already owned by another client'
          );
        }
        return initializeApp(options, APP_NAME);
      },
      getRemoteConfig,
      createProvider: (remoteConfig) =>
        createFirebaseProvider({
          remoteConfig,
          customSignals: (context) => ({
            donor_id: normalizedDonorId(context.targetId),
          }),
        }),
      deleteApp,
    }),
  }
);

const unavailableProvider: FeatureProvider = {
  connect: async () => ({
    evaluate: () => ({ kind: 'unavailable', reason: 'unavailable' }),
    subscribe: () => () => undefined,
    close: () => undefined,
  }),
};

/** Loads configuration once; account changes cancel their connection, never shared setup. */
export class ConfiguredFeatureProvider implements FeatureProvider {
  private setup?: Promise<FeatureProvider>;
  private readonly cancelled = new Subject<void>();
  private destroyed = false;
  private ownedApp?: FirebaseApp;

  constructor(
    private readonly http: HttpClient,
    private readonly baseUri: string,
    private readonly runtime: FeatureFlagsRuntime
  ) {}

  async connect(
    context: EvaluationContext,
    signal: AbortSignal
  ): Promise<ProviderSession> {
    this.checkConnection(signal);
    const provider = await (this.setup ??= this.loadProvider());
    this.checkConnection(signal);
    return provider.connect(context, signal);
  }

  cancelSetup(): void {
    this.destroyed = true;
    this.cancelled.next();
    this.cancelled.complete();
  }

  async dispose(): Promise<void> {
    this.cancelSetup();
    if (!this.ownedApp) return;
    const app = this.ownedApp;
    this.ownedApp = undefined;
    await this.runtime.deleteApp(app);
  }

  private async loadProvider(): Promise<FeatureProvider> {
    try {
      const url = new URL('assets/feature-flags.json', this.baseUri).toString();
      const raw = await firstValueFrom(
        this.http
          .get<unknown>(url)
          .pipe(timeout(FEATURE_FLAGS_TIMEOUT_MS), takeUntil(this.cancelled))
      );
      const config = parseFeatureFlagsConfig(raw);
      if (!config.enabled || this.destroyed) return unavailableProvider;
      if (!(await this.runtime.isSupported()) || this.destroyed)
        return unavailableProvider;

      this.ownedApp = this.runtime.createApp(config.firebase);
      const remoteConfig = this.runtime.getRemoteConfig(this.ownedApp);
      remoteConfig.settings.fetchTimeoutMillis = FEATURE_FLAGS_TIMEOUT_MS;
      return this.runtime.createProvider(remoteConfig);
    } catch {
      return unavailableProvider;
    }
  }

  private checkConnection(signal: AbortSignal): void {
    if (signal.aborted || this.destroyed)
      throw new Error('Feature flags connection cancelled');
  }
}
