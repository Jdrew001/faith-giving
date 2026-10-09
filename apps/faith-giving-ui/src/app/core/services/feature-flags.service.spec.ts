import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  fakeAsync,
  flushMicrotasks,
  TestBed,
  tick,
} from '@angular/core/testing';
import { NgZone } from '@angular/core';
import {
  EvaluationContext,
  FeatureDecision,
  FeatureProvider,
  ProviderSession,
} from '@feature-gates/core';
import { FirebaseApp } from 'firebase/app';
import { RemoteConfig } from 'firebase/remote-config';
import { BehaviorSubject } from 'rxjs';

import { AuthService } from './auth.service';
import {
  FEATURE_FLAGS_RUNTIME,
  FeatureFlagsRuntime,
} from './feature-flags.provider';
import { FeatureFlagsService } from './feature-flags.service';

const DONOR_A = 'b2f7a161-37c0-4a06-b205-321b201d00ca';
const DONOR_B = '741ae580-8a7b-4ad3-a97c-df17c8e109ef';
const CONFIG = {
  enabled: true,
  firebase: { apiKey: 'key', projectId: 'project', appId: 'app' },
};

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;
  let http: HttpTestingController;
  let individual: BehaviorSubject<{ id: string } | null>;
  let runtime: FeatureFlagsRuntime;
  let contexts: EvaluationContext[];
  let decisions: FeatureDecision[];
  let notifications: Set<() => void>;
  let enabled: boolean;
  let zone: NgZone;

  beforeEach(() => {
    individual = new BehaviorSubject(null);
    contexts = [];
    decisions = [];
    notifications = new Set();
    enabled = false;
    const provider: FeatureProvider = {
      connect: jest.fn((context: EvaluationContext) => {
        contexts.push(context);
        return Promise.resolve(liveSession());
      }),
    };
    runtime = {
      isSupported: jest.fn(() => Promise.resolve(true)),
      createApp: jest.fn(() => ({ name: 'test-flags' } as FirebaseApp)),
      getRemoteConfig: jest.fn(() => ({ settings: {} } as RemoteConfig)),
      createProvider: jest.fn(() => provider),
      deleteApp: jest.fn(() => Promise.resolve()),
    };
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: { individual$: individual.asObservable() },
        },
        { provide: FEATURE_FLAGS_RUNTIME, useValue: runtime },
      ],
    });
    service = TestBed.inject(FeatureFlagsService);
    http = TestBed.inject(HttpTestingController);
    zone = TestBed.inject(NgZone);
    service
      .decision$('betaAccess')
      .subscribe((decision) => decisions.push(decision));
  });

  afterEach(() => {
    service.ngOnDestroy();
    http.verify({ ignoreCancelled: true });
  });

  function liveSession(): ProviderSession {
    return {
      evaluate: () => ({ kind: 'value', value: enabled, source: 'provider' }),
      subscribe: (listener) => {
        notifications.add(listener);
        return () => notifications.delete(listener);
      },
      close: jest.fn(),
    };
  }

  function configurationRequest() {
    return http.expectOne(
      new URL('assets/feature-flags.json', document.baseURI).toString()
    );
  }

  it('starts once without waiting for configuration and shares setup across account changes', fakeAsync(() => {
    service.initialize();
    service.initialize();
    expect(service.snapshot('betaAccess').enabled).toBe(false);
    flushMicrotasks();
    const request = configurationRequest();
    individual.next({ id: DONOR_A.toUpperCase() });
    individual.next({ id: DONOR_B });
    request.flush(CONFIG);
    flushMicrotasks();
    expect(runtime.createApp).toHaveBeenCalledTimes(1);
    expect(contexts.map((context) => context.targetId)).toEqual([DONOR_B]);
    individual.next({ id: DONOR_B });
    flushMicrotasks();
    expect(contexts).toHaveLength(1);
  }));

  it('clears targeting on logout and rejects invalid donor IDs', fakeAsync(() => {
    individual.next({ id: DONOR_A });
    service.initialize();
    flushMicrotasks();
    configurationRequest().flush(CONFIG);
    flushMicrotasks();
    individual.next(null);
    flushMicrotasks();
    individual.next({ id: 'not-a-uuid' });
    flushMicrotasks();
    expect(contexts.map((context) => context.targetId)).toEqual([
      DONOR_A,
      'anonymous',
    ]);
  }));

  it.each([{ enabled: false }, { enabled: true, firebase: {} }])(
    'stays off without initializing Firebase for %p',
    (config) => {
      fakeAsync(() => {
        service.initialize();
        flushMicrotasks();
        configurationRequest().flush(config);
        flushMicrotasks();
        expect(service.snapshot('betaAccess')).toMatchObject({
          enabled: false,
          status: 'degraded',
          source: 'fallback',
        });
        expect(runtime.isSupported).not.toHaveBeenCalled();
        expect(runtime.createApp).not.toHaveBeenCalled();
      })();
    }
  );

  it('falls back on missing configuration', fakeAsync(() => {
    service.initialize();
    flushMicrotasks();
    configurationRequest().flush('Missing', {
      status: 404,
      statusText: 'Not found',
    });
    flushMicrotasks();
    expect(service.snapshot('betaAccess').enabled).toBe(false);
    expect(runtime.createApp).not.toHaveBeenCalled();
  }));

  it('settles off after three seconds when configuration never responds', fakeAsync(() => {
    service.initialize();
    flushMicrotasks();
    const request = configurationRequest();
    tick(3000);
    flushMicrotasks();
    expect(request.cancelled).toBe(true);
    expect(service.snapshot('betaAccess')).toMatchObject({
      enabled: false,
      status: 'degraded',
    });
  }));

  it('keeps unsupported browsers off', fakeAsync(() => {
    (runtime.isSupported as jest.Mock).mockResolvedValue(false);
    service.initialize();
    flushMicrotasks();
    configurationRequest().flush(CONFIG);
    flushMicrotasks();
    expect(runtime.createApp).not.toHaveBeenCalled();
    expect(service.snapshot('betaAccess').enabled).toBe(false);
  }));

  it('recovers after slow setup and publishes live changes inside Angular', fakeAsync(() => {
    let resolveSupport: (value: boolean) => void;
    (runtime.isSupported as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveSupport = resolve;
      })
    );
    service.initialize();
    flushMicrotasks();
    configurationRequest().flush(CONFIG);
    flushMicrotasks();
    tick(3000);
    expect(service.snapshot('betaAccess')).toMatchObject({
      enabled: false,
      reason: 'timeout',
    });
    enabled = true;
    resolveSupport(true);
    flushMicrotasks();
    expect(service.snapshot('betaAccess').enabled).toBe(true);

    let insideAngular = false;
    const subscription = service.decision$('betaAccess').subscribe(() => {
      insideAngular = NgZone.isInAngularZone();
    });
    enabled = false;
    zone.runOutsideAngular(() => notifications.forEach((notify) => notify()));
    expect(insideAngular).toBe(true);
    expect(service.snapshot('betaAccess').enabled).toBe(false);
    subscription.unsubscribe();
  }));

  it('drops an old donor result after an account switch', fakeAsync(() => {
    let finishOld: (session: ProviderSession) => void;
    const oldSession = liveSession();
    const connect = jest.fn((context: EvaluationContext) => {
      contexts.push(context);
      if (context.targetId === DONOR_A)
        return new Promise<ProviderSession>((resolve) => {
          finishOld = resolve;
        });
      return Promise.resolve(liveSession());
    });
    (runtime.createProvider as jest.Mock).mockReturnValue({ connect });
    individual.next({ id: DONOR_A });
    service.initialize();
    flushMicrotasks();
    configurationRequest().flush(CONFIG);
    flushMicrotasks();
    individual.next({ id: DONOR_B });
    flushMicrotasks();
    const currentDecision = service.snapshot('betaAccess');
    finishOld(oldSession);
    flushMicrotasks();
    expect(oldSession.close).toHaveBeenCalled();
    expect(service.snapshot('betaAccess')).toBe(currentDecision);
  }));

  it('cancels HTTP and completes streams on disposal before setup finishes', fakeAsync(() => {
    const complete = jest.fn();
    service.decision$('betaAccess').subscribe({ complete });
    service.initialize();
    flushMicrotasks();
    const request = configurationRequest();
    service.ngOnDestroy();
    flushMicrotasks();
    expect(request.cancelled).toBe(true);
    expect(complete).toHaveBeenCalledTimes(1);
    expect(runtime.createApp).not.toHaveBeenCalled();
    const count = decisions.length;
    individual.next({ id: DONOR_A });
    flushMicrotasks();
    expect(decisions).toHaveLength(count);
  }));

  it('does not create an app when support finishes after disposal', fakeAsync(() => {
    let resolveSupport: (value: boolean) => void;
    (runtime.isSupported as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveSupport = resolve;
      })
    );
    service.initialize();
    flushMicrotasks();
    configurationRequest().flush(CONFIG);
    flushMicrotasks();
    service.ngOnDestroy();
    resolveSupport(true);
    flushMicrotasks();
    expect(runtime.createApp).not.toHaveBeenCalled();
  }));

  it('closes provider listeners before deleting the owned app', fakeAsync(() => {
    const listenerCountsAtDeletion: number[] = [];
    (runtime.deleteApp as jest.Mock).mockImplementation(() => {
      listenerCountsAtDeletion.push(notifications.size);
      return Promise.resolve();
    });
    service.initialize();
    flushMicrotasks();
    configurationRequest().flush(CONFIG);
    flushMicrotasks();
    expect(notifications.size).toBe(1);
    service.ngOnDestroy();
    flushMicrotasks();
    expect(notifications.size).toBe(0);
    expect(runtime.deleteApp).toHaveBeenCalledTimes(1);
    expect(listenerCountsAtDeletion).toEqual([0]);
  }));
});
