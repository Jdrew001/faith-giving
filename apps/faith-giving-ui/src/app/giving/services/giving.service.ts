import { ElementRef, EnvironmentInjector, Injectable } from '@angular/core';
import { BaseService } from '../../utils/base.service';
import { HttpClient } from '@angular/common/http';
import { Reference } from '../models/reference.model';
import { catchError } from 'rxjs';
import { GiveConstants } from '../giving.constants';
import { GrowlService } from '../../core/growl.service';
import { PaymentIntent } from '../models/giving.model';
import { StripeElementsOptions } from '@stripe/stripe-js';
import { GivingFormService } from './giving-form.service';
import { FormArray } from '@angular/forms';

@Injectable()
export class GivingService extends BaseService {

  private _categories: Reference[] = [];
  get categories() { return this._categories; }
  set categories(value) { this._categories = value; }

  private _paymentIntent: PaymentIntent;
  get paymentIntent() { return this._paymentIntent; }
  set paymentIntent(value) { this._paymentIntent = value; }

  activeIndex = 0;

  constructor(
    private http: HttpClient,
    protected override growlService: GrowlService,
    private formService: GivingFormService
  ) {
    super(growlService);
  }

  generatePaymentIntent(body: any) {
    const url = this.getApiUrl(GiveConstants.GIVE_PAYMENT_INTENT_PATH);
    this.http.post(url, body)
      .pipe(catchError((err) => this.handleError(err)))
      .subscribe((result: PaymentIntent) => {
        this.paymentIntent = result;
        this.activeIndex = 1;
      });
  }

  async createPaymentMethod(stripe, number: ElementRef, zipCode: number) {
    return await stripe.createPaymentMethod(this.generateBodyForPaymentMethod(number, zipCode));
  }

  async submitPayment(stripe, element: ElementRef, zipCode: number) {
    let paymentMethod = await this.createPaymentMethod(stripe, element, zipCode);
    console.log('paymentMethod', paymentMethod);

    if (!paymentMethod) {
      this.growlService.showErrorMessage('There was a problem with your payment method. Please try again.');
      return;
    }

    if (paymentMethod.error) {
      this.growlService.showErrorMessage('There was a problem with your payment method. Please try again.');
      return;
    }

    this.processPayment(paymentMethod);
    
  }

  getCategoryReferenceData() {
    const url = this.getApiUrl(GiveConstants.GIVE_REFERENCE_PATH);
    this.http.get(url)
      .pipe(catchError((err) => this.handleError(err)))
      .subscribe((data: Reference[]) => {
        this.categories = data;
    });
  }

  calculateTotal(tithe, offering: FormArray) : number {
    let offeringTotal = 0;
    offering?.controls.forEach(val => {
      offeringTotal += val.get('amount')?.value;
    });

    if (this.formService.feeCovered.value && (tithe.value + offeringTotal) !== 0) {
      return +(tithe.value + offeringTotal + (((tithe.value + offeringTotal) * GiveConstants.RATE_FEE) + 0.30)).toFixed(2);
    }

    return tithe.value + offeringTotal;
  }

  private processPayment(paymentMethod: any) {
    let body = this.generateBodyForPayment(paymentMethod);
    const url = this.getApiUrl(GiveConstants.GIVE_PAYMENT_PATH);
    this.http.post(url, body)
      .pipe(catchError((err) => this.handleError(err)))
      .subscribe((result: any) => {
        this.handlePaymentSuccess(result);
      });
  }

  private generateBodyForPaymentMethod(number: ElementRef, zipCode: number) {
    return {
      type: 'card',
      card: number,
      billing_details: {
        email: this.formService.email.value,
        name: `${this.formService.firstName.value} ${this.formService.lastName.value}`,
        phone: this.formService.phone.value,
        address: {
          postal_code: zipCode
        }
      }
    }
  }

  private generateBodyForPayment(paymentMethod: any) {
    return {
      paymentMethodId: paymentMethod['paymentMethod']['id'],
      giveDetails: this.formService.givingForm.getRawValue()
    }
  }

  private handlePaymentSuccess(result: any) {
    if (result['success']) {
      this.formService.givingForm.reset();
      this.growlService.showSuccessMessage('Your payment was successful!');
      this.activeIndex = 0;
    } else {
      this.growlService.showErrorMessage('There was a problem with your payment. Please try again.');
    }
  }
}
