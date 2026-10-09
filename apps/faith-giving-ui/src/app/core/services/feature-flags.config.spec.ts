import {
  donorContext,
  normalizedDonorId,
  parseFeatureFlagsConfig,
} from './feature-flags.config';

const DONOR_ID = 'B2F7A161-37C0-4A06-B205-321B201D00CA';

describe('feature flag configuration and donor identity', () => {
  it('uses only a normalized UUID for targeting', () => {
    expect(donorContext({ id: ` ${DONOR_ID} ` })).toEqual({
      targetId: DONOR_ID.toLowerCase(),
    });
    for (const id of [undefined, '', 'donor@example.com', 'anonymous', 123]) {
      expect(normalizedDonorId(id)).toBeNull();
      expect(donorContext({ id })).toEqual({ targetId: 'anonymous' });
    }
    expect(donorContext(null)).toEqual({ targetId: 'anonymous' });
  });

  it('enables Firebase only for complete explicit browser configuration', () => {
    expect(
      parseFeatureFlagsConfig({
        enabled: true,
        firebase: {
          apiKey: ' key ',
          projectId: ' project ',
          appId: ' app ',
          authDomain: 'example.com',
        },
      })
    ).toEqual({
      enabled: true,
      firebase: {
        apiKey: 'key',
        projectId: 'project',
        appId: 'app',
        authDomain: 'example.com',
      },
    });
  });

  it.each([
    null,
    [],
    {},
    { enabled: false },
    { enabled: 'true' },
    { enabled: true },
    { enabled: true, firebase: { apiKey: 'key', projectId: '', appId: 'app' } },
    {
      enabled: true,
      firebase: {
        apiKey: 'key',
        projectId: 'project',
        appId: 'app',
        messagingSenderId: 123,
      },
    },
  ])('keeps malformed or disabled configuration off: %p', (value) => {
    expect(parseFeatureFlagsConfig(value)).toEqual({ enabled: false });
  });
});
