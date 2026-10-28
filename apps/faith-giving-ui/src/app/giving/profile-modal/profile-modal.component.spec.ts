import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { GrowlService } from '../../core/growl.service';
import { BaseConstants } from '../../utils/base.constants';
import { GiveConstants } from '../giving.constants';
import { GivingModule } from '../giving.module';
import { ProfileModalComponent } from './profile-modal.component';

describe('ProfileModalComponent', () => {
  let fixture: ComponentFixture<ProfileModalComponent>;
  let component: ProfileModalComponent;
  let http: HttpTestingController;
  let auth: { individual: typeof donor; updateProfile: jest.Mock };
  const donor = {
    id: 'profile-donor',
    firstname: 'Alex',
    lastname: 'Morgan',
    email: 'alex@example.test',
    phone: '+16825550123',
  };
  const card = {
    id: 'saved-card',
    paymentMethodId: 'pm_saved_card',
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2028,
  };
  const paymentMethodsUrl =
    BaseConstants.PROD_URL + GiveConstants.PAYMENT_METHODS;

  beforeEach(async () => {
    auth = {
      individual: { ...donor },
      updateProfile: jest
        .fn()
        .mockReturnValue(of({ success: true, data: donor })),
    };
    await TestBed.configureTestingModule({
      imports: [GivingModule, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: auth },
        {
          provide: GrowlService,
          useValue: {
            showSuccessMessage: jest.fn(),
            showErrorMessage: jest.fn(),
          },
        },
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ProfileModalComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    http.verify();
    fixture.destroy();
  });

  function openProfile(phone = donor.phone) {
    fixture.componentRef.setInput('individual', { ...donor, phone });
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();
    return http.expectOne(paymentMethodsUrl);
  }

  it.each(['+16825550123', '16825550123', '6825550123', '+1 (682) 555-0123'])(
    'displays the full national number with a separate country prefix for %s',
    async (phone) => {
      openProfile(phone).flush({ success: true, data: [] });
      await fixture.whenStable();
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector(
        '#profile-phone'
      ) as HTMLInputElement;
      expect(input.value).toBe('+1 (682) 555-0123');
      expect(input.readOnly).toBe(true);
      expect(component.profileForm.get('phone')?.value).toBe('6825550123');
      component.saveProfile();
      expect(auth.updateProfile).toHaveBeenCalledWith({
        firstname: donor.firstname,
        lastname: donor.lastname,
        email: donor.email,
        phone: donor.phone,
      });
    }
  );

  it('loads and displays saved cards from the configured API with session credentials', () => {
    const request = openProfile();
    expect(request.request.method).toBe('GET');
    expect(request.request.withCredentials).toBe(true);
    expect(component.loadingPaymentMethods).toBe(true);
    request.flush({ success: true, data: [card] });
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.payment-methods-list').textContent
    ).toContain('4242');
    expect(
      fixture.nativeElement.querySelector('.no-payment-methods')
    ).toBeNull();
    expect(component.loadingPaymentMethods).toBe(false);
  });

  it('shows an error instead of an empty list on failure and can retry', () => {
    openProfile().flush('Unavailable', {
      status: 503,
      statusText: 'Unavailable',
    });
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role="alert"]').textContent
    ).toContain('Unable to load');
    expect(
      fixture.nativeElement.querySelector('.no-payment-methods')
    ).toBeNull();
    fixture.nativeElement
      .querySelector('.payment-methods-error button')
      .click();
    expect(component.loadingPaymentMethods).toBe(true);
    http.expectOne(paymentMethodsUrl).flush({ success: true, data: [card] });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(
      fixture.nativeElement.querySelector('.payment-methods-list').textContent
    ).toContain('4242');
  });

  it('does not report an expired session as having no saved cards', () => {
    openProfile().flush({ success: false, message: 'Session expired' });
    fixture.detectChanges();
    expect(component.paymentMethodsError).toBe(true);
    expect(
      fixture.nativeElement.querySelector('.no-payment-methods')
    ).toBeNull();
  });

  it('shows the empty state only after a successful empty response', () => {
    openProfile().flush({ success: true, data: [] });
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.no-payment-methods').textContent
    ).toContain('No saved payment methods');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
  });
});
