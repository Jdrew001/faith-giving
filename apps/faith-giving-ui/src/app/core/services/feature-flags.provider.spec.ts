import { HttpClient } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { createFirebaseProvider } from '@feature-gates/firebase';
import { getApps, initializeApp } from 'firebase/app';
import { RemoteConfig } from 'firebase/remote-config';

import {
  ConfiguredFeatureProvider,
  FEATURE_FLAGS_RUNTIME,
  FeatureFlagsRuntime,
} from './feature-flags.provider';

jest.mock('@feature-gates/firebase', () => ({
  createFirebaseProvider: jest.fn(),
}));
jest.mock('firebase/app', () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(),
  deleteApp: jest.fn(),
}));
jest.mock('firebase/remote-config', () => ({
  getRemoteConfig: jest.fn(),
  isSupported: jest.fn(),
}));

describe('feature flag Firebase boundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getApps as jest.Mock).mockReturnValue([]);
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
  });

  it('always supplies donor_id and explicitly unsets anonymous or invalid donors', () => {
    const runtime = TestBed.inject(FEATURE_FLAGS_RUNTIME);
    runtime.createProvider({} as RemoteConfig);
    const options = (createFirebaseProvider as jest.Mock).mock.calls[0][0];
    const id = 'b2f7a161-37c0-4a06-b205-321b201d00ca';
    expect(options.customSignals({ targetId: id.toUpperCase() })).toEqual({
      donor_id: id,
    });
    expect(options.customSignals({ targetId: 'anonymous' })).toEqual({
      donor_id: null,
    });
    expect(options.customSignals({ targetId: 'not-a-uuid' })).toEqual({
      donor_id: null,
    });
  });

  it('never claims ownership of an existing named Firebase app', () => {
    (getApps as jest.Mock).mockReturnValue([
      { name: 'faith-giving-feature-flags' },
    ]);
    const runtime = TestBed.inject(FEATURE_FLAGS_RUNTIME);
    expect(() => runtime.createApp({ appId: 'app' })).toThrow('already owned');
    expect(initializeApp).not.toHaveBeenCalled();
  });

  it('resolves configuration under the deployed /give/ base', fakeAsync(() => {
    const runtime = TestBed.inject(
      FEATURE_FLAGS_RUNTIME
    ) as FeatureFlagsRuntime;
    const http = TestBed.inject(HttpClient);
    const requests = TestBed.inject(HttpTestingController);
    const provider = new ConfiguredFeatureProvider(
      http,
      'https://example.com/give/',
      runtime
    );
    const result = provider.connect(
      { targetId: 'anonymous' },
      new AbortController().signal
    );
    result.catch(() => undefined);
    requests
      .expectOne('https://example.com/give/assets/feature-flags.json')
      .flush({ enabled: false });
    flushMicrotasks();
    requests.verify();
    void provider.dispose();
  }));
});
