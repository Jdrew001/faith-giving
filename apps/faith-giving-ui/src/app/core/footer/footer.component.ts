import { GivingExperienceService } from '../services/giving-experience.service';
import { HostBinding, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.legacy.css', './footer.component.css'],
})
export class FooterComponent {
  @HostBinding('class.redesign') get redesignEnabled() {
    return this.experience.enabled;
  }
  @HostBinding('class.legacy') get legacyEnabled() {
    return !this.experience.enabled;
  }

  constructor(public readonly experience: GivingExperienceService) {}
  year = new Date().getFullYear();
}
