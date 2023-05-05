import { Component, OnInit } from '@angular/core';
import { GivingFormService } from './services/giving-form.service';
import { GivingService } from './services/giving.service';
import { FormControl, FormGroup } from '@angular/forms';
import { GrowlService } from '../core/growl.service';
import { StripeService, StripePaymentElementComponent } from 'ngx-stripe';
import {
  StripeElementsOptions,
  PaymentIntent
} from '@stripe/stripe-js';

@Component({
  selector: 'faith-giving-giving',
  templateUrl: './giving.component.html',
  styleUrls: ['./giving.component.css'],
})
export class GivingComponent implements OnInit {

  get givingForm() { return this.formService.givingForm; }
  formSubmitted = false;
  activeFormIndex = 0;

  elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };

  constructor(
    private formService: GivingFormService,
    private growlService: GrowlService,
    private giveService: GivingService
  ) {}

  ngOnInit() {
    this.giveService.getCategoryReferenceData();
    this.formService.createGivingForm();
  }
  payWithStripe() {
    this.activeFormIndex = 1;
  }

  submitForm() {
    this.formSubmitted = true;
    if (!this.givingForm.invalid) {
      console.log('Form Submitted', this.givingForm.getRawValue());

      return;
    }

    this.handleFormError();
  }

  handleFormError() {
    this.growlService.showErrorMessage('Please fix the errors in the form before submitting.');
  }
}
