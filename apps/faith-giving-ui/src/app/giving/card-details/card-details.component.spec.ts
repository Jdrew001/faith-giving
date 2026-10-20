import { GivingExperienceService } from '../../core/services/giving-experience.service';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SkeletonModule } from 'primeng/skeleton';
import { GrowlService } from '../../core/growl.service';
import { CardDetailsComponent } from './card-details.component';

describe('CardDetailsComponent', () => {
  let fixture: ComponentFixture<CardDetailsComponent>;
  let component: CardDetailsComponent;
  let fields: Record<
    string,
    {
      mount: jest.Mock;
      addEventListener: jest.Mock;
      listeners: Record<string, () => void>;
    }
  >;
  const growl = { showErrorMessage: jest.fn() };

  beforeEach(async () => {
    growl.showErrorMessage.mockClear();
    fields = {};
    for (const name of ['cardNumber', 'cardExpiry', 'cardCvc']) {
      const listeners: Record<string, () => void> = {};
      fields[name] = {
        mount: jest.fn(),
        listeners,
        addEventListener: jest.fn((event, listener) => {
          listeners[event] = listener;
        }),
      };
    }
    await TestBed.configureTestingModule({
      declarations: [CardDetailsComponent],
      imports: [FormsModule, CheckboxModule, SkeletonModule],
      providers: [
        {
          provide: GivingExperienceService,
          useValue: {
            enabled: true,
            lockGift: jest.fn(),
            releaseGift: jest.fn(),
          },
        },
        { provide: GrowlService, useValue: growl },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CardDetailsComponent);
    component = fixture.componentInstance;
    component.stripe = {
      elements: () => ({ create: (name: string) => fields[name] }),
    };
    component.total = 125;
  });

  function mountFields() {
    fixture.detectChanges();
    tick(200);
  }

  function readyAllFields() {
    mountFields();
    fields['cardNumber'].listeners['ready']();
    fields['cardExpiry'].listeners['ready']();
    fields['cardCvc'].listeners['ready']();
    tick(1000);
    fixture.detectChanges();
  }

  it('uses the dark Stripe style and self-hosted font only for the redesign', fakeAsync(() => {
    const create = jest.fn().mockImplementation((name: string) => fields[name]);
    component.stripe = { elements: jest.fn(() => ({ create })) };
    mountFields();
    expect(component.stripe.elements).toHaveBeenCalledWith({
      fonts: [
        {
          family: 'Poppins',
          src: `url(${
            new URL('assets/fonts/Poppins-Regular.woff2', document.baseURI).href
          })`,
          weight: '400',
        },
      ],
    });
    expect(create.mock.calls[0][1]).toMatchObject({
      style: {
        base: { color: '#ffffff', fontFamily: 'Poppins, Arial, sans-serif' },
      },
      disableLink: true,
    });
    expect(
      fixture.nativeElement
        .querySelector('input[inputmode="numeric"]')
        ?.getAttribute('type')
    ).toBe('text');
  }));

  it('keeps the original Stripe configuration and card template when beta_access is off', fakeAsync(() => {
    TestBed.inject(GivingExperienceService).enabled = false;
    const create = jest.fn().mockImplementation((name: string) => fields[name]);
    component.stripe = { elements: jest.fn(() => ({ create })) };
    mountFields();
    expect(component.stripe.elements).toHaveBeenCalledWith();
    expect(create.mock.calls[0][1]).toMatchObject({
      style: { base: { color: '#1a1b21' } },
    });
    expect(create.mock.calls[0][1]).not.toHaveProperty('disableLink');
    expect(
      fixture.nativeElement.querySelector('input[type="number"]')
    ).toBeTruthy();
  }));

  it('waits for every Stripe field before enabling the amount-specific payment action', fakeAsync(() => {
    mountFields();
    const button = fixture.nativeElement.querySelector(
      '.pay-button'
    ) as HTMLButtonElement;
    expect(button.textContent).toContain('Give $125.00');
    expect(button.disabled).toBe(true);
    fields['cardNumber'].listeners['ready']();
    tick(1000);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    fields['cardExpiry'].listeners['ready']();
    tick(1000);
    fixture.detectChanges();
    expect(button.disabled).toBe(true);
    fields['cardCvc'].listeners['ready']();
    tick(1000);
    fixture.detectChanges();
    expect(button.disabled).toBe(false);
  }));

  it('preserves a leading-zero ZIP code when submitting a new card', fakeAsync(() => {
    readyAllFields();
    component.zipCode = '02108';
    const submit = jest.spyOn(component.submit$, 'next');
    component.submit();
    expect(submit).toHaveBeenCalledWith({
      number: fields['cardNumber'],
      zipCode: '02108',
      savePaymentMethod: false,
    });
  }));

  it('shows a ZIP error without submitting a nonnumeric postal code', fakeAsync(() => {
    readyAllFields();
    component.zipCode = 'ABCDE';
    const submit = jest.spyOn(component.submit$, 'next');
    component.submit();
    fixture.detectChanges();
    expect(submit).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain(
      'Please provide a 5-digit ZIP code'
    );
    expect(growl.showErrorMessage).toHaveBeenCalled();
  }));

  it('blocks another submission while a payment is processing', fakeAsync(() => {
    readyAllFields();
    component.zipCode = '76010';
    component.initRequest = true;
    const submit = jest.spyOn(component.submit$, 'next');
    component.submit();
    fixture.detectChanges();
    expect(submit).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.pay-button').disabled).toBe(
      true
    );
  }));
});
