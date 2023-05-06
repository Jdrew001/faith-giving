import { EnvironmentInjector, Injectable } from '@angular/core';
import { BaseService } from '../../utils/base.service';
import { HttpClient } from '@angular/common/http';
import { Reference } from '../models/reference.model';
import { catchError } from 'rxjs';
import { GiveConstants } from '../giving.constants';
import { GrowlService } from '../../core/growl.service';
import { PaymentIntent } from '../models/giving.model';
import { StripeElementsOptions } from '@stripe/stripe-js';

@Injectable()
export class GivingService extends BaseService {

  private _categories: Reference[] = [];
  get categories() { return this._categories; }
  set categories(value) { this._categories = value; }

  private _paymentIntent: PaymentIntent;
  get paymentIntent() { return this._paymentIntent; }
  set paymentIntent(value) { this._paymentIntent = value; }

  elementsOptions: StripeElementsOptions = {
    locale: 'en',
    clientSecret: ''
  };

  activeIndex = 0;

  constructor(
    private http: HttpClient,
    protected override growlService: GrowlService
  ) {
    super(growlService);
  }

  generatePaymentIntent(body: any) {
    const url = this.getApiUrl(GiveConstants.GIVE_PAYMENT_INTENT_PATH);
    this.http.post(url, body)
      .pipe(catchError((err) => this.handleError(err)))
      .subscribe((result: PaymentIntent) => {
        this.paymentIntent = result;
        this.elementsOptions.clientSecret = this.paymentIntent.clientSecret;

        this.activeIndex = 1;
      });
  }

  getCategoryReferenceData() {
    const url = this.getApiUrl(GiveConstants.GIVE_REFERENCE_PATH);
    this.http.get(url)
      .pipe(catchError((err) => this.handleError(err)))
      .subscribe((data: Reference[]) => {
        this.categories = data;
    });
  }
}
