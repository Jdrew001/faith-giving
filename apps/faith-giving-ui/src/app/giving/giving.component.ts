import { Component, ElementRef, OnInit } from '@angular/core';
import { GivingFormService } from './services/giving-form.service';
import { GivingService } from './services/giving.service';
import { GrowlService } from '../core/growl.service';
import { GiveConstants } from './giving.constants';

declare var Stripe;

@Component({
  selector: 'faith-giving-giving',
  templateUrl: './giving.component.html',
  styleUrls: ['./giving.component.css'],
})
export class GivingComponent implements OnInit {

  get givingForm() { return this.formService.givingForm; }
  get formSubmitted() { return this.giveService.formSubmitted; }
  get activeFormIndex() { return this.giveService.activeIndex; }
  get stripeKey() { return process.env['NODE_ENV'] == 'development' ? GiveConstants.STRIPE_PK_TEST : GiveConstants.STRIPE_PK;}

  stripe;
  giveTotal = 0;

  constructor(
    private formService: GivingFormService,
    private growlService: GrowlService,
    private giveService: GivingService
  ) {}

  ngOnInit() {
    this.stripe = Stripe(GiveConstants.STRIPE_PK);
    this.giveService.getCategoryReferenceData();
    this.formService.createGivingForm();

    this.formService.givingForm.valueChanges.subscribe((value) => {
      console.log('value', value)
      this.giveTotal = this.giveService.calculateTotal(value.tithe, value.offerings);
    });
  }
  payWithStripe() {
    this.giveService.formSubmitted = true;
    if (this.givingForm.invalid) {
      this.growlService.showErrorMessage('Please fix the errors in the form before submitting.');
      return;
    }
    this.giveService.activeIndex = 1;
  }

  async submitForm(data: {number: ElementRef, zipCode: number}) {
    await this.giveService.submitPayment(this.stripe, data.number, data.zipCode);
  }

  handleFormError() {
    this.growlService.showErrorMessage('Please fix the errors in the form before submitting.');
  }

  convertToNumber(value: string) {
    return parseFloat(value.replace(/[$,\.]/g, ""));
  }

  previous() {
    this.giveService.activeIndex--;
  }

  clearFields() {
    this.formService.givingForm.markAsPristine();
    this.formService.givingForm.reset();
    this.giveService.formSubmitted = false;
  }
}
