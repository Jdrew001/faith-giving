import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GivingFlowService {
  view: 'sign-in' | 'giving' = 'sign-in';
  isGuest = false;
  prefillPhone = '';

  showSignIn(): void {
    this.isGuest = false;
    this.prefillPhone = '';
    this.view = 'sign-in';
  }

  showGiving(): void {
    this.isGuest = false;
    this.prefillPhone = '';
    this.view = 'giving';
  }

  continueAsGuest(phone = ''): void {
    this.isGuest = true;
    this.prefillPhone = phone;
    this.view = 'giving';
  }
}
