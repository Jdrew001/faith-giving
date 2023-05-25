import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { GiveConstants } from '../giving.constants';
import { GrowlService } from '../../core/growl.service';

@Component({
  selector: 'faith-giving-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.css'],
})
export class CardDetailsComponent implements AfterViewInit {

  @Input() formSubmitted: boolean;
  @Input() stripe;

  @ViewChild('numberElement') numberElement: ElementRef;
  @ViewChild('expElement') expElement: ElementRef;
  @ViewChild('cvvElement') cvvElement: ElementRef;

  @Output() submit$: EventEmitter<any> = new EventEmitter();
  @Output() backToPrevious$: EventEmitter<any> = new EventEmitter(); 

  number;
  exp;
  cvv;
  cardErrors;
  expErrors;
  cvvErrors;
  zipCode;

  elementStyles = {
    base: {
      color: 'black',
      fontFamily: 'Source Code Pro, Consolas, Menlo, monospace',
      fontSize: '18px',
      fontSmoothing: 'antialiased',
      borderBottom: '1px solid #DEDEDE',

      '::placeholder': {
        color: '#6C757D',
      },
      ':-webkit-autofill': {
        color: 'black',
      },
    },
    invalid: {
      color: '#E25950',
      '::placeholder': {
        color: 'black',
      },
    },
  };

  elementClasses = {
    focus: 'focused',
    empty: 'empty',
    invalid: 'invalid',
  };

  get isCreditCardFormValid() {
    return !this.cardErrors && !this.expErrors && !this.cvvErrors && this.zipCode?.toString()?.length !== '' && this.zipCode?.toString()?.length === 5;
  }

  constructor(
    private growlService: GrowlService
  ) {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initStripeElements();
      this.initStripeListenters();
    },200)
  }

  submit() {
    if (!this.isCreditCardFormValid) {
      this.growlService.showErrorMessage('Please fix the errors in the form before submitting.');
      return;
    }
    this.submit$.next({number: this.number, zipCode: this.zipCode});
  }

  backToPrevious() {
    this.backToPrevious$.next(true);
  }

  private initStripeElements() {
    const elements = this.stripe.elements();
    this.number = elements.create('cardNumber', {
      style: this.elementStyles,
      classes: this.elementClasses
    });
    this.exp = elements.create('cardExpiry', {
      style: this.elementStyles,
      classes: this.elementClasses
    });
    this.cvv = elements.create('cardCvc', {
      style: this.elementStyles,
      classes: this.elementClasses
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
          error: error
        }
      }
    });
    this.number.addEventListener('ready', ({ error, empty }) => {
      this.cardErrors = null;
      if (error || empty) {
        this.cardErrors = {
          isEmpty: empty,
          error: error
        }
      }
    });

    this.exp.addEventListener('change', ({ error, empty }) => {
      this.expErrors = null;
      if (error || empty) {
        this.expErrors = {
          isEmpty: empty,
          error: error
        }
      }
    });
    this.exp.addEventListener('ready', ({ error, empty }) => {
      this.expErrors = null;
      if (error || empty) {
        this.expErrors = {
          isEmpty: empty,
          error: error
        }
      }
    });

    this.cvv.addEventListener('change', ({ error, empty }) => {
      this.cvvErrors = null;
      if (error || empty) {
        this.cvvErrors = {
          isEmpty: empty,
          error: error
        }
      }
    });
    this.cvv.addEventListener('ready', ({ error, empty }) => {
      this.cvvErrors = null;
      if (error || empty) {
        this.cvvErrors = {
          isEmpty: empty,
          error: error
        }
      }
    });
  }
}
