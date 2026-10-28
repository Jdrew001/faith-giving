import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GivingFlowService } from '../core/services/giving-flow.service';
import { of } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { GrowlService } from '../core/growl.service';
import { GivingModule } from './giving.module';
import { GivingComponent } from './giving.component';
import { GivingFormService } from './services/giving-form.service';
import { GivingService } from './services/giving.service';

describe('GivingComponent', () => {
  let fixture: ComponentFixture<GivingComponent>;
  let component: GivingComponent;
  let form: GivingFormService;
  const donor = {
    id: 'donor-test',
    firstname: 'Alex',
    lastname: 'Morgan',
    email: 'alex@example.com',
    phone: '5550000198',
  };
  const card = {
    paymentMethodId: 'pm_test_saved',
    brand: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2028,
  };
  let giving: GivingService;
  let auth: {
    isAuthenticated: boolean;
    individual: typeof donor | null;
    checkSession: jest.Mock;
    signOut: jest.Mock;
  };

  beforeEach(async () => {
    auth = {
      isAuthenticated: false,
      individual: null,
      checkSession: jest.fn().mockResolvedValue(null),
      signOut: jest.fn(),
    };
    giving = {
      activeIndex: 0,
      formSubmitted: false,
      requestInit: false,
      giveTotal: 125,
      individualInfo: null,
      userEdit: true,
      confirmationDetails: null,
      categories: [
        { id: 1, label: 'General Offering' },
        { id: 7, label: 'Other' },
      ],
      getCategoryReferenceData: jest.fn(),
      getGiftItems: jest.fn().mockReturnValue([
        { label: 'Tithe', amount: 100 },
        { label: 'General Offering', amount: 25 },
      ]),
      registerTitheOfferingChanges: jest.fn(),
      fetchPaymentMethods: jest
        .fn()
        .mockReturnValue(of({ success: true, data: [card] })),
      submitPayment: jest.fn(),
      submitPaymentWithSavedMethod: jest.fn().mockImplementation(() => {
        giving.requestInit = true;
      }),
    } as unknown as GivingService;
    Object.assign(window, { Stripe: jest.fn().mockReturnValue({}) });
    await TestBed.configureTestingModule({
      imports: [GivingModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: GrowlService, useValue: { showErrorMessage: jest.fn() } },
      ],
    })
      .overrideProvider(GivingService, { useValue: giving })
      .compileComponents();
    TestBed.inject(GivingFlowService).continueAsGuest();
    fixture = TestBed.createComponent(GivingComponent);
    component = fixture.componentInstance;
    form = TestBed.inject(GivingFormService);
    fixture.detectChanges();
  });

  it('preserves payment controls while processing and returns to gift details on Done', () => {
    auth.isAuthenticated = true;
    auth.individual = donor;
    giving.activeIndex = 1;
    component.savedPaymentMethods = [card];
    component.selectPaymentMethod(card.paymentMethodId);
    fixture.detectChanges();
    const payment = fixture.nativeElement.querySelector('input[type="radio"]');
    giving.requestInit = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[type="radio"]')).toBe(
      payment
    );
    expect(fixture.nativeElement.querySelector('[role="status"]')).toBeTruthy();
    giving.requestInit = false;
    component.done();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.step-badge').textContent
    ).toContain('Step 1 of 2');
  });

  it('keeps guest details and gift amounts in the first step', () => {
    expect(fixture.nativeElement.textContent).toContain(
      'Step 1 of 2 · Gift details'
    );
    expect(fixture.nativeElement.querySelector('#giving-email')).toBeTruthy();
    const button = fixture.nativeElement.querySelector(
      '.pay-button'
    ) as HTMLButtonElement;
    button.click();
    expect(component.activeFormIndex).toBe(0);
    expect(fixture.nativeElement.textContent).not.toContain('Recurring');
  });

  it('adds and removes offerings through the accessible actions', () => {
    const add = fixture.nativeElement.querySelector(
      '.add-offering-btn'
    ) as HTMLButtonElement;
    add.click();
    fixture.detectChanges();
    expect(form.offerings.length).toBe(1);
    const remove = fixture.nativeElement.querySelector(
      '[aria-label="Remove offering 1"]'
    ) as HTMLButtonElement;
    remove.click();
    fixture.detectChanges();
    expect(form.offerings.length).toBe(0);
  });

  it('opens payment without carrying guest-field validation errors into the card form', () => {
    form.givingForm.patchValue({
      email: donor.email,
      firstName: donor.firstname,
      lastName: donor.lastname,
      phone: donor.phone,
      tithe: '$125.00',
    });
    component.payWithStripe();
    expect(giving.activeIndex).toBe(1);
    expect(giving.formSubmitted).toBe(false);
  });

  it('submits the selected saved card and announces processing without destroying the payment view', async () => {
    auth.isAuthenticated = true;
    auth.individual = donor;
    component.applyAuthenticatedIndividual(donor);
    giving.activeIndex = 1;
    fixture.detectChanges();
    const radio = fixture.nativeElement.querySelector(
      'input[type="radio"]'
    ) as HTMLInputElement;
    expect(radio.checked).toBe(true);
    expect(
      fixture.nativeElement.querySelector('.pay-button').textContent
    ).toContain('Give $125.00');
    await component.submitForm({
      number: null,
      zipCode: null,
      savePaymentMethod: false,
    });
    fixture.detectChanges();
    expect(giving.submitPaymentWithSavedMethod).toHaveBeenCalledWith(
      'pm_test_saved',
      false,
      '•••• 4242'
    );
    expect(giving.submitPayment).not.toHaveBeenCalled();
    expect(
      fixture.nativeElement.querySelector('[role="status"]').textContent
    ).toContain('Processing your gift');
    expect(
      fixture.nativeElement
        .querySelector('.card-container')
        .hasAttribute('inert')
    ).toBe(true);
    expect(
      fixture.nativeElement.querySelector('input[type="radio"]')
    ).toBeTruthy();
  });

  it('ignores repeat submissions while a gift is processing', async () => {
    giving.requestInit = true;
    await component.submitForm({ number: null, zipCode: null });
    expect(giving.submitPayment).not.toHaveBeenCalled();
    expect(giving.submitPaymentWithSavedMethod).not.toHaveBeenCalled();
  });

  it('shows real receipt details and retains the existing print receipt action', () => {
    giving.activeIndex = 2;
    giving.confirmationDetails = {
      total: 125,
      date: new Date('2026-10-20T12:00:00'),
      paymentMethod: '•••• 4242',
      items: [
        { label: 'Tithe', amount: 100 },
        { label: 'General Offering', amount: 25 },
      ],
      feeCovered: false,
      feeAmount: 0,
    };
    const print = jest
      .spyOn(window, 'print')
      .mockImplementation(() => undefined);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('$125.00');
    expect(fixture.nativeElement.textContent).toContain('General Offering');
    (
      fixture.nativeElement.querySelector(
        '.confirmation-actions button'
      ) as HTMLButtonElement
    ).click();
    expect(print).toHaveBeenCalledTimes(1);
    print.mockRestore();
  });
});
