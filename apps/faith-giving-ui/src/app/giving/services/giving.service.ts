import { ElementRef, EnvironmentInjector, Injectable } from '@angular/core';
import { BaseService } from '../../utils/base.service';
import { HttpClient } from '@angular/common/http';
import { Reference } from '../models/reference.model';
import { catchError, debounceTime, distinctUntilChanged } from 'rxjs';
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
  formSubmitted = false;
  requestInit = false;
  giveTotal = 0;

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
    this.requestInit = true;
    let paymentMethod = await this.createPaymentMethod(stripe, element, zipCode);
    console.log('paymentMethod', paymentMethod);

    if (!paymentMethod) {
      this.requestInit = false;
      this.growlService.showErrorMessage('There was a problem with your payment method. Please try again.');
      return;
    }

    if (paymentMethod.error) {
      this.requestInit = false;
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

  calculateTotal(tithe, offering: {amount: string}[]) {
    const url = this.getApiUrl(GiveConstants.CALCULATE_TOTAL);
    let convertedTithe = this.convertToNumber(tithe);
    let covertedOfferings = offering.map(o => 
      {return {amount: this.convertToNumber(o.amount)}}
    )
    this.http.post(url, {tithe: convertedTithe, offerings: covertedOfferings, feeCovered: this.formService.feeCovered.value})
      .pipe(
        debounceTime(800),
        distinctUntilChanged()
        )
      .subscribe((value: {success: boolean, data: number}) => {
        if (value.success) {
          this.giveTotal = value.data;
        } else {
          console.error("ERROR: Fetching the total from service!!!");
        }
      })
  }

  registerTitheOfferingChanges() {
    let offerings$ = this.formService.offerings?.valueChanges;
    let tithe$ = this.formService.tithe?.valueChanges;
    let feeCovered$ = this.formService.feeCovered?.valueChanges;

    tithe$.subscribe(() => this.calculateTotal(this.formService.tithe.value, this.formService.offerings.value));
    offerings$.subscribe(() => {
      this.calculateTotal(this.formService.tithe.value, this.formService.offerings.value);
      this.updateRefDataState();
    });
    feeCovered$.subscribe(() => this.calculateTotal(this.formService.tithe.value, this.formService.offerings.value));
  }

  updateRefDataState() {
    const selectedOfferingsArr = this.formService.offerings as FormArray;
    const selectedOfferings = selectedOfferingsArr.value as Array<{category: number}>;
    this.categories.forEach(category => {
      category.disabled = false;

      const isSelected = selectedOfferings.find(o => o.category === category.id);
      if (isSelected && category.label !== 'Other') {
        category.disabled = true;
      }
    });

    this.formService.givingForm.updateValueAndValidity();
  }

  convertToNumber(value: string) {
    return parseFloat(value.replace(/[$,]/g, ""));
  }

  private processPayment(paymentMethod: any) {
    let body = this.generateBodyForPayment(paymentMethod);
    const url = this.getApiUrl(GiveConstants.GIVE_PAYMENT_PATH);
    this.http.post(url, body)
      .pipe(catchError((err) => {this.requestInit = false; return this.handleError(err)}))
      .subscribe((result: any) => {
        this.requestInit = false;
        this.giveTotal = 0;
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
      giveDetails: this.convertStringValueToNumber(this.formService.givingForm.getRawValue())
    }
  }

  private convertStringValueToNumber(rawValue) {
    let convertedTithe = this.convertToNumber(rawValue.tithe);
    let convertedOfferings = rawValue.offerings.map(val => {
      return {
        ...val,
        amount: this.convertToNumber(val.amount)
      }
    });

    return {
      ...rawValue,
      tithe: convertedTithe,
      offerings: convertedOfferings
    }
  }

  private handlePaymentSuccess(result: any) {
    if (result['success']) {
      this.formService.createGivingForm();
      this.formService.givingForm.markAsPristine();
      this.formSubmitted = false;
      this.growlService.showSuccessMessage('Your giving was successful!');
      this.activeIndex = 0;
      this.registerTitheOfferingChanges();
    } else {
      this.growlService.showErrorMessage('There was a problem with your giving. Please try again.');
    }
  }
}
