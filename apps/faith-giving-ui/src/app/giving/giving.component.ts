import { AfterViewInit, Component, ElementRef, OnInit } from '@angular/core';
import { GivingFormService } from './services/giving-form.service';
import { GivingService } from './services/giving.service';
import { GrowlService } from '../core/growl.service';
import { GiveConstants } from './giving.constants';
import { combineLatest, zip } from 'rxjs';
import { UserDetails } from './models/giving.model';

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
  get requestInit() { return this.giveService.requestInit; }
  get giveTotal() { return this.giveService.giveTotal; }
  get userDetails() { return this.giveService.individualInfo; }
  get userEdit() { return this.giveService.userEdit; }

  stripe;

  constructor(
    private formService: GivingFormService,
    private growlService: GrowlService,
    public giveService: GivingService
  ) {}

  ngOnInit() {
    this.stripe = Stripe(this.stripeKey);
    this.giveService.getCategoryReferenceData();
    this.giveService.fetchIndividual();
    this.formService.createGivingForm();
    this.giveService.registerTitheOfferingChanges();
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
    if(this.giveService.userEdit) {
      this.formService.givingForm.reset();
    } else {
      this.formService.tithe.setValue('$0.00');
      this.formService.offerings.clear();
      this.formService.feeCovered.setValue(false);
    }
    this.giveService.formSubmitted = false;
  }

  onEdit(userDetails: UserDetails) {
    this.giveService.userEdit = true;
  }

  cancelEdit() {
    this.giveService.userEdit = false;
  }
}
