import { Component, OnInit } from '@angular/core';
import { GivingFormService } from './services/giving-form.service';
import { FormControl, FormGroup } from '@angular/forms';
import { GrowlService } from '../core/growl.service';

@Component({
  selector: 'faith-giving-giving',
  templateUrl: './giving.component.html',
  styleUrls: ['./giving.component.css'],
})
export class GivingComponent implements OnInit {

  get givingForm() { return this.formService.givingForm; }
  formSubmitted = false;

  constructor(
    private formService: GivingFormService,
    private growlService: GrowlService
  ) {}

  ngOnInit() {
    this.formService.createGivingForm();
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
