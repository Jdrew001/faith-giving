import { GivingExperienceService } from '../services/giving-experience.service';
import { HostBinding, Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ProfileModalService } from '../services/profile-modal.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.legacy.css', './header.component.css'],
})
export class HeaderComponent {
  @HostBinding('class.redesign') get redesignEnabled() {
    return this.experience.enabled;
  }
  @HostBinding('class.legacy') get legacyEnabled() {
    return !this.experience.enabled;
  }

  title = 'Faith Giving';

  constructor(
    public readonly experience: GivingExperienceService,
    public authService: AuthService,
    private profileModalService: ProfileModalService
  ) {}

  get initials(): string {
    const ind = this.authService.individual;
    if (!ind) return '';
    return (
      (ind.firstname?.charAt(0) || '') + (ind.lastname?.charAt(0) || '')
    ).toUpperCase();
  }

  onAvatarClick() {
    if (this.authService.isAuthenticated) {
      this.profileModalService.open();
    }
  }
}
