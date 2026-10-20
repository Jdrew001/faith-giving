import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { FeatureFlagsService } from './feature-flags.service';

/** One presentation decision for the entire app, held through each gift. */
@Injectable({ providedIn: 'root' })
export class GivingExperienceService implements OnDestroy {
  enabled = false;
  private desired = false;
  private locked = false;
  private readonly subscription: Subscription;
  private readonly originalThemeColor: string | null;
  private readonly originalThemeMeta: HTMLMetaElement | null;
  private themeMeta: HTMLMetaElement | null;

  constructor(
    flags: FeatureFlagsService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.originalThemeMeta = document.querySelector('meta[name="theme-color"]');
    this.themeMeta = this.originalThemeMeta;
    this.originalThemeColor = this.themeMeta?.getAttribute('content') ?? null;
    this.subscription = flags.decision$('betaAccess').subscribe((decision) => {
      this.desired = decision.status === 'ready' && decision.enabled;
      if (!this.locked) this.applyDecision();
    });
  }

  lockGift(): void {
    this.locked = true;
  }

  releaseGift(): void {
    this.locked = false;
    this.applyDecision();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.desired = false;
    this.applyDecision();
  }

  private applyDecision(): void {
    this.enabled = this.desired;
    this.document.documentElement.classList.toggle(
      'faith-giving-redesign',
      this.enabled
    );
    if (!this.enabled) {
      this.restoreThemeColor();
      return;
    }
    if (!this.themeMeta) {
      this.themeMeta = this.document.createElement('meta');
      this.themeMeta.name = 'theme-color';
      this.document.head.appendChild(this.themeMeta);
    }
    this.themeMeta.content = '#0b0b0b';
  }

  private restoreThemeColor(): void {
    if (!this.originalThemeMeta) {
      this.themeMeta?.remove();
      this.themeMeta = null;
      return;
    }
    if (this.originalThemeColor === null)
      this.themeMeta?.removeAttribute('content');
    else this.themeMeta?.setAttribute('content', this.originalThemeColor);
  }
}
