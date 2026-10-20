import { HostBinding, Component, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, Subscription } from 'rxjs';

import { AppVersionService } from './core/services/app-version.service';
import { FeatureFlagsService } from './core/services/feature-flags.service';
import { GivingExperienceService } from './core/services/giving-experience.service';

@Component({
  selector: 'faith-giving-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  @HostBinding('class.redesign') get redesignEnabled() {
    return this.experience.enabled;
  }
  @HostBinding('class.legacy') get legacyEnabled() {
    return !this.experience.enabled;
  }

  title = 'faith-giving-ui';
  private betaAccessSubscription?: Subscription;

  constructor(
    public readonly experience: GivingExperienceService,
    private appVersionService: AppVersionService,
    private featureFlagsService: FeatureFlagsService
  ) {}

  ngOnInit(): void {
    this.appVersionService.initialize();
    this.featureFlagsService.initialize();
    this.logBetaAccessFeatureFlag();
  }

  ngOnDestroy(): void {
    this.betaAccessSubscription?.unsubscribe();
  }

  private logBetaAccessFeatureFlag(): void {
    this.betaAccessSubscription = this.featureFlagsService
      .decision$('betaAccess')
      .pipe(
        filter((decision) => decision.status !== 'pending'),
        map((decision) => decision.enabled),
        distinctUntilChanged()
      )
      .subscribe((enabled) => {
        console.log(`beta_access is ${enabled ? 'enabled' : 'disabled'}`);
      });
  }
}
