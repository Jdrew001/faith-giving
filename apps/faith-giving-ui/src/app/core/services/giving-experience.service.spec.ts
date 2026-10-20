import { TestBed } from '@angular/core/testing';
import { FeatureDecision } from '@feature-gates/core';
import { BehaviorSubject } from 'rxjs';
import { FeatureFlagsService } from './feature-flags.service';
import { GivingExperienceService } from './giving-experience.service';

describe('GivingExperienceService', () => {
  let decisions: BehaviorSubject<Pick<FeatureDecision, 'enabled' | 'status'>>;
  let service: GivingExperienceService;

  beforeEach(() => {
    decisions = new BehaviorSubject({ enabled: false, status: 'pending' });
    TestBed.configureTestingModule({
      providers: [
        {
          provide: FeatureFlagsService,
          useValue: { decision$: () => decisions },
        },
      ],
    });
    service = TestBed.inject(GivingExperienceService);
  });

  it('uses the original experience until beta_access is ready and true', () => {
    expect(service.enabled).toBe(false);
    decisions.next({ enabled: true, status: 'pending' });
    expect(service.enabled).toBe(false);
    decisions.next({ enabled: true, status: 'degraded' });
    expect(service.enabled).toBe(false);
    decisions.next({ enabled: true, status: 'ready' });
    expect(service.enabled).toBe(true);
    expect(
      document.documentElement.classList.contains('faith-giving-redesign')
    ).toBe(true);
    expect(
      document
        .querySelector('meta[name="theme-color"]')
        ?.getAttribute('content')
    ).toBe('#0b0b0b');
    decisions.next({ enabled: false, status: 'ready' });
    expect(service.enabled).toBe(false);
    expect(
      document.documentElement.classList.contains('faith-giving-redesign')
    ).toBe(false);
    expect(document.querySelector('meta[name="theme-color"]')).toBeNull();
  });

  it('allows a late ready value before gift entry begins', () => {
    decisions.next({ enabled: true, status: 'ready' });
    expect(service.enabled).toBe(true);
  });

  it.each([false, true])(
    'holds the %s experience during gift entry and payment',
    (initial) => {
      decisions.next({ enabled: initial, status: 'ready' });
      service.lockGift();
      decisions.next({ enabled: !initial, status: 'ready' });
      expect(service.enabled).toBe(initial);
      expect(
        document.documentElement.classList.contains('faith-giving-redesign')
      ).toBe(initial);
      service.releaseGift();
      expect(service.enabled).toBe(!initial);
    }
  );

  it('applies the latest fallback after leaving or completing a gift', () => {
    decisions.next({ enabled: true, status: 'ready' });
    service.lockGift();
    decisions.next({ enabled: false, status: 'pending' });
    decisions.next({ enabled: false, status: 'degraded' });
    expect(service.enabled).toBe(true);
    service.releaseGift();
    expect(service.enabled).toBe(false);
  });

  it('removes the theme and subscription on destruction', () => {
    decisions.next({ enabled: true, status: 'ready' });
    service.lockGift();
    service.ngOnDestroy();
    decisions.next({ enabled: true, status: 'ready' });
    expect(service.enabled).toBe(false);
    expect(
      document.documentElement.classList.contains('faith-giving-redesign')
    ).toBe(false);
    expect(document.querySelector('meta[name="theme-color"]')).toBeNull();
  });

  it('restores a pre-existing browser theme color when disabled', () => {
    const page = document.implementation.createHTMLDocument('Existing theme');
    const theme = page.createElement('meta');
    theme.name = 'theme-color';
    theme.content = '#f9f9ff';
    page.head.appendChild(theme);
    const flags = {
      decision$: () => decisions,
    } as unknown as FeatureFlagsService;
    const experience = new GivingExperienceService(flags, page);
    decisions.next({ enabled: true, status: 'ready' });
    expect(theme.content).toBe('#0b0b0b');
    decisions.next({ enabled: false, status: 'ready' });
    expect(theme.content).toBe('#f9f9ff');
    experience.ngOnDestroy();
  });
});
