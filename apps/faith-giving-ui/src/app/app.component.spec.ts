import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CommonModule, Location } from '@angular/common';
import { GivingFlowService } from './core/services/giving-flow.service';

import { AppComponent } from './app.component';
import { AppVersionService } from './core/services/app-version.service';

describe('AppComponent', () => {
  const appVersionService = { initialize: jest.fn() };
  const location = { replaceState: jest.fn() };

  beforeEach(async () => {
    appVersionService.initialize.mockClear();
    location.replaceState.mockClear();
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [AppComponent],
      providers: [
        { provide: AppVersionService, useValue: appVersionService },
        { provide: Location, useValue: location },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('creates the app with the primary theme without flag configuration', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.title).toEqual('faith-giving-ui');
    expect(fixture.nativeElement.classList.contains('redesign')).toBe(true);
  });

  afterEach(() => window.history.replaceState(null, '', '/'));

  it('replaces old entry paths and consumes guest prefills without creating another URL', () => {
    window.history.replaceState(
      null,
      '',
      '/give/give?guest=true&phone=5555550100'
    );
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const flow = TestBed.inject(GivingFlowService);
    expect(location.replaceState).toHaveBeenCalledWith('/');
    expect(flow.view).toBe('giving');
    expect(flow.isGuest).toBe(true);
    expect(flow.prefillPhone).toBe('5555550100');
  });

  it('initializes version checks on startup', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(appVersionService.initialize).toHaveBeenCalledTimes(1);
  });
});
