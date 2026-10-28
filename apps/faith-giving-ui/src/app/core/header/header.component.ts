import { HostBinding, Component } from '@angular/core';
import { GivingFlowService } from '../services/giving-flow.service';
import { AuthService } from '../services/auth.service';
import { ProfileModalService } from '../services/profile-modal.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @HostBinding('class.redesign') readonly primaryTheme = true;

  title = 'Faith Giving';

  constructor(
    public authService: AuthService,
    public readonly flow: GivingFlowService,
    private profileModalService: ProfileModalService
  ) {}

  get initials(): string {
    const ind = this.authService.individual;
    if (!ind) return '';
    return (
      (ind.firstname?.charAt(0) || '') + (ind.lastname?.charAt(0) || '')
    ).toUpperCase();
  }

  showHome(): void {
    if (this.authService.isAuthenticated) this.flow.showGiving();
    else this.flow.showSignIn();
  }

  onAvatarClick() {
    if (this.authService.isAuthenticated) {
      this.profileModalService.open();
    }
  }
}
