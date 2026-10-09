import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FeatureDecision } from '@feature-gates/core';
import { Subject } from 'rxjs';

import { AppComponent } from './app.component';
import { AppVersionService } from './core/services/app-version.service';
import { FeatureFlagsService } from './core/services/feature-flags.service';

describe('AppComponent', () => {
  const appVersionService = {
    initialize: jest.fn(),
  };
  const featureFlagsService = {
    initialize: jest.fn(),
    decision$: jest.fn(),
  };
  let betaAccessDecisions: Subject<Pick<FeatureDecision, 'enabled' | 'status'>>;

  beforeEach(async () => {
    appVersionService.initialize.mockClear();
    featureFlagsService.initialize.mockClear();
    betaAccessDecisions = new Subject();
    featureFlagsService.decision$.mockReset();
    featureFlagsService.decision$.mockReturnValue(betaAccessDecisions);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: FeatureFlagsService, useValue: featureFlagsService },
        {
          provide: AppVersionService,
          useValue: appVersionService,
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
    expect(app.title).toEqual('faith-giving-ui');
  });

  it('should initialize version checks on startup', () => {
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    expect(appVersionService.initialize).toHaveBeenCalledTimes(1);
    expect(featureFlagsService.initialize).toHaveBeenCalledTimes(1);
  });

  it('logs settled beta_access state changes and stops logging after destruction', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(featureFlagsService.decision$).toHaveBeenCalledWith('betaAccess');

      betaAccessDecisions.next({ enabled: false, status: 'pending' });
      expect(log).not.toHaveBeenCalled();
      betaAccessDecisions.next({ enabled: true, status: 'ready' });
      betaAccessDecisions.next({ enabled: true, status: 'ready' });
      betaAccessDecisions.next({ enabled: false, status: 'pending' });
      betaAccessDecisions.next({ enabled: false, status: 'degraded' });
      expect(log.mock.calls).toEqual([
        ['beta_access is enabled'],
        ['beta_access is disabled'],
      ]);

      fixture.destroy();
      betaAccessDecisions.next({ enabled: true, status: 'ready' });
      expect(log).toHaveBeenCalledTimes(2);
    } finally {
      log.mockRestore();
    }
  });
});
