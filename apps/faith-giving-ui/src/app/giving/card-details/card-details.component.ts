import { GivingExperienceService } from '../../core/services/giving-experience.service';
import {
  HostBinding,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { GrowlService } from '../../core/growl.service';

@Component({
  selector: 'faith-giving-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: [
    './card-details.component.legacy.css',
    './card-details.component.css',
  ],
})
export class CardDetailsComponent implements AfterViewInit {
  @HostBinding('class.redesign') get redesignEnabled() {
    return this.experience.enabled;
  }
  @HostBinding('class.legacy') get legacyEnabled() {
    return !this.experience.enabled;
  }

  @Input() formSubmitted: boolean;
  @Input() stripe;
  @Input() initRequest = false;
  @Input() isAuthenticated = false;
  @Input() hasSavedPaymentMethods = false;
  @Input() total = 0;

  @ViewChild('numberElement') numberElement: ElementRef;
  @ViewChild('expElement') expElement: ElementRef;
  @ViewChild('cvvElement') cvvElement: ElementRef;

  @Output() submit$: EventEmitter<any> = new EventEmitter();
  @Output() backToPrevious$: EventEmitter<any> = new EventEmitter();
  @Output() backToPaymentMethods$: EventEmitter<any> = new EventEmitter();
  @Output() savePaymentMethodChange: EventEmitter<boolean> = new EventEmitter();

  cardLoaded = false;
  cvvLoaded = false;
  expLoaded = false;

  number;
  exp;
  cvv;
  cardErrors;
  expErrors;
  cvvErrors;
  zipCode;
  savePaymentMethod = false;

  private readonly redesignElementStyles = {
    base: {
      color: '#ffffff',
      iconColor: '#ffffff',
      fontFamily: 'Poppins, Arial, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',

      '::placeholder': {
        color: '#b9b9b9',
      },
      ':-webkit-autofill': {
        color: '#ffffff',
      },
      '::-webkit-input-placeholder': {
        color: '#b9b9b9',
      },
    },
    invalid: {
      color: '#ffb4ab',
      iconColor: '#ffb4ab',
      '::placeholder': {
        color: '#b9b9b9',
      },
    },
  };

  private readonly legacyElementStyles = {
    base: {
      color: '#1a1b21',
      iconColor: '#1a1b21',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      fontSize: '16px',
      fontSmoothing: 'antialiased',

      '::placeholder': {
        color: '#76777b',
      },
      ':-webkit-autofill': {
        color: '#1a1b21',
      },
      '::-webkit-input-placeholder': {
        color: '#76777b',
      },
    },
    invalid: {
      color: '#ba1a1a',
      iconColor: '#ba1a1a',
      '::placeholder': {
        color: '#76777b',
      },
    },
  };

  get elementStyles() {
    return this.experience.enabled
      ? this.redesignElementStyles
      : this.legacyElementStyles;
  }

  elementClasses = {
    focus: 'focused',
    empty: 'empty',
    invalid: 'invalid',
  };

  get isZipCodeValid() {
    return this.experience.enabled
      ? /^\d{5}$/.test(this.zipCode?.toString() ?? '')
      : this.zipCode?.toString()?.length === 5;
  }

  get isCreditCardFormValid() {
    return (
      !this.cardErrors &&
      !this.expErrors &&
      !this.cvvErrors &&
      this.isZipCodeValid
    );
  }

  constructor(
    public readonly experience: GivingExperienceService,
    private growlService: GrowlService
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.initStripeElements();
      this.initStripeListenters();
    }, 200);
  }

  submit() {
    if (this.experience.enabled && this.initRequest) return;
    if (this.experience.enabled) this.formSubmitted = true;
    if (!this.isCreditCardFormValid) {
      this.growlService.showErrorMessage(
        'Please fix the errors in the form before submitting.'
      );
      return;
    }
    this.submit$.next({
      number: this.number,
      zipCode: this.zipCode,
      savePaymentMethod: this.savePaymentMethod,
    });
  }

  backToPrevious() {
    this.backToPrevious$.next(true);
  }

  backToPaymentMethods() {
    this.backToPaymentMethods$.next(true);
  }

  private initStripeElements() {
    const fontUrl = new URL(
      'assets/fonts/Poppins-Regular.woff2',
      document.baseURI
    ).href;
    const elements = this.experience.enabled
      ? this.stripe.elements({
          fonts: [{ family: 'Poppins', src: `url(${fontUrl})`, weight: '400' }],
        })
      : this.stripe.elements();
    this.number = elements.create('cardNumber', {
      style: this.elementStyles,
      classes: this.elementClasses,
      ...(this.experience.enabled ? { disableLink: true } : {}),
      placeholder: '1234 1234 1234 1234',
    });
    this.exp = elements.create('cardExpiry', {
      style: this.elementStyles,
      classes: this.elementClasses,
      placeholder: 'MM / YY',
    });
    this.cvv = elements.create('cardCvc', {
      style: this.elementStyles,
      classes: this.elementClasses,
      placeholder: 'CVC',
    });
    this.number.mount(this.numberElement.nativeElement);
    this.exp.mount(this.expElement.nativeElement);
    this.cvv.mount(this.cvvElement.nativeElement);
  }

  private initStripeListenters() {
    this.number.addEventListener('change', ({ error, empty }) => {
      this.cardErrors = null;
      if (error || empty) {
        this.cardErrors = {
          isEmpty: empty,
          error: error,
        };
      }
    });
    this.number.addEventListener('ready', () => {
      this.cardErrors = null;
      setTimeout(() => {
        this.cardLoaded = true;
      }, 1000);
    });

    this.exp.addEventListener('change', ({ error, empty }) => {
      this.expErrors = null;
      if (error || empty) {
        this.expErrors = {
          isEmpty: empty,
          error: error,
        };
      }
    });
    this.exp.addEventListener('ready', () => {
      this.expErrors = null;
      if (!this.experience.enabled) this.cvvLoaded = true;
      setTimeout(() => {
        if (this.experience.enabled) this.expLoaded = true;
        else this.cvvLoaded = true;
      }, 1000);
    });

    this.cvv.addEventListener('change', ({ error, empty }) => {
      this.cvvErrors = null;
      if (error || empty) {
        this.cvvErrors = {
          isEmpty: empty,
          error: error,
        };
      }
    });
    this.cvv.addEventListener('ready', () => {
      this.cvvErrors = null;
      if (!this.experience.enabled) this.expLoaded = true;
      setTimeout(() => {
        if (this.experience.enabled) this.cvvLoaded = true;
        else this.expLoaded = true;
      }, 1000);
    });
  }
}
