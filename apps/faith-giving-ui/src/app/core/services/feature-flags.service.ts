import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, NgZone, OnDestroy } from '@angular/core';
import {
  createFeatureClient,
  FeatureClient,
  FeatureDecision,
} from '@feature-gates/core';
import {
  distinctUntilChanged,
  map,
  Observable,
  ReplaySubject,
  Subscription,
  takeUntil,
} from 'rxjs';

import { AuthService } from './auth.service';
import {
  donorContext,
  FEATURE_CATALOG,
  FEATURE_FLAGS_TIMEOUT_MS,
  FeatureKey,
} from './feature-flags.config';
import {
  ConfiguredFeatureProvider,
  FEATURE_FLAGS_RUNTIME,
  FeatureFlagsRuntime,
} from './feature-flags.provider';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService implements OnDestroy {
  private readonly provider: ConfiguredFeatureProvider;
  private readonly client: FeatureClient<typeof FEATURE_CATALOG>;
  private readonly destroyed = new ReplaySubject<void>(1);
  private authSubscription?: Subscription;
  private initialized = false;
  private disposed = false;

  constructor(
    http: HttpClient,
    @Inject(DOCUMENT) document: Document,
    @Inject(FEATURE_FLAGS_RUNTIME) runtime: FeatureFlagsRuntime,
    private readonly auth: AuthService,
    private readonly zone: NgZone
  ) {
    this.provider = new ConfiguredFeatureProvider(
      http,
      document.baseURI,
      runtime
    );
    this.client = createFeatureClient({
      catalog: FEATURE_CATALOG,
      provider: this.provider,
      initializationTimeoutMs: FEATURE_FLAGS_TIMEOUT_MS,
    });
  }

  initialize(): void {
    if (this.initialized || this.disposed) return;
    this.initialized = true;
    this.authSubscription = this.auth.individual$
      .pipe(
        map((individual) => donorContext(individual)),
        distinctUntilChanged(
          (previous, current) => previous.targetId === current.targetId
        )
      )
      .subscribe((context) => {
        // Context replacement/disposal can reject superseded startup promises.
        void this.client.setContext(context).catch(() => undefined);
      });
  }

  decision$(feature: FeatureKey): Observable<FeatureDecision> {
    return new Observable<FeatureDecision>((subscriber) => {
      const emit = () =>
        this.zone.run(() => subscriber.next(this.client.getSnapshot(feature)));
      const unsubscribe = this.client.subscribe(feature, emit);
      emit();
      return unsubscribe;
    }).pipe(takeUntil(this.destroyed));
  }

  snapshot(feature: FeatureKey): FeatureDecision {
    return this.client.getSnapshot(feature);
  }

  ngOnDestroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.authSubscription?.unsubscribe();
    this.provider.cancelSetup();
    this.destroyed.next();
    this.destroyed.complete();
    void this.client
      .dispose()
      .then(() => this.provider.dispose())
      .catch(() => undefined);
  }
}
