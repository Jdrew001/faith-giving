import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import {
  AppVersionService,
  WHATS_NEW_SEEN_VERSION_KEY,
  WhatsNewState,
} from './app-version.service';

describe('AppVersionService', () => {
  let service: AppVersionService;
  let http: HttpTestingController;
  let states: Array<WhatsNewState | null>;

  beforeEach(() => {
    window.localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(AppVersionService);
    http = TestBed.inject(HttpTestingController);
    states = [];
    service.whatsNew$.subscribe((state) => states.push(state));
  });

  afterEach(() => {
    http.verify();
    window.localStorage.clear();
  });

  it('does not show the modal when the current version was already seen', () => {
    window.localStorage.setItem(WHATS_NEW_SEEN_VERSION_KEY, '1.0.4');

    service.initialize();
    expectVersionRequest().flush({ version: '1.0.4' });

    http.expectNone((request) => request.urlWithParams.includes('whats-new.json'));
    expect(latestState()).toBeNull();
  });

  it('shows the modal for an exact patch-version change and stores it on dismissal', () => {
    window.localStorage.setItem(WHATS_NEW_SEEN_VERSION_KEY, '1.0.3');

    service.initialize();
    expectVersionRequest().flush({
      version: '1.0.4',
      buildVersion: '1.0.4-build.1234567890',
      buildNumber: '1234567890',
    });
    expectWhatsNewRequest().flush({
      version: '1.0.4',
      title: 'Fresh fixes',
      items: [
        {
          title: 'Giving flow polish',
          description: 'Patch-level improvements are now announced.',
        },
      ],
    });

    expect(latestState()?.version.version).toBe('1.0.4');
    expect(latestState()?.content.title).toBe('Fresh fixes');

    service.dismissCurrentVersion();

    expect(window.localStorage.getItem(WHATS_NEW_SEEN_VERSION_KEY)).toBe('1.0.4');
    expect(latestState()).toBeNull();
  });

  it('falls back safely when whats-new metadata is missing', () => {
    service.initialize();
    expectVersionRequest().flush({ version: '1.0.5' });
    expectWhatsNewRequest().flush('Not found', {
      status: 404,
      statusText: 'Not Found',
    });

    expect(latestState()?.content).toEqual({
      version: '1.0.5',
      title: "What's New in v1.0.5",
      items: [
        {
          title: 'Faith Giving was updated',
          description: 'This version includes the latest improvements and fixes.',
        },
      ],
    });
  });

  it('falls back safely when whats-new metadata is for another version', () => {
    service.initialize();
    expectVersionRequest().flush({ version: '1.0.6' });
    expectWhatsNewRequest().flush({
      version: '1.0.5',
      title: 'Old update',
      items: [{ title: 'Old item', description: 'Old copy' }],
    });

    expect(latestState()?.content.title).toBe("What's New in v1.0.6");
    expect(latestState()?.content.items[0].title).toBe('Faith Giving was updated');
  });

  function expectVersionRequest() {
    return http.expectOne((request) => request.urlWithParams.startsWith('./assets/version.json?v='));
  }

  function expectWhatsNewRequest() {
    return http.expectOne((request) => request.urlWithParams.startsWith('./assets/whats-new.json?v='));
  }

  function latestState(): WhatsNewState | null {
    return states[states.length - 1];
  }
});
