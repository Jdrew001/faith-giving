import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { GiveFormValidator } from '../validators/give-validator';

@Injectable()
export class GivingFormService {

  givingForm: FormGroup;
  giveValidator = new GiveFormValidator()

  get offerings() { return this.givingForm.controls['offerings'] as FormArray; }

  constructor(
    private fb: FormBuilder
  ) { }

  createGivingForm() {
    this.givingForm = new FormGroup({
      email: this.fb.control('', [Validators.required, Validators.email]),
      firstName: this.fb.control('', [Validators.required]),
      lastName: this.fb.control('', [Validators.required]),
      phone: this.fb.control('', [Validators.required]),
      tithe: this.fb.control(0),
      offerings: this.fb.array([])
    }, [this.giveValidator.oneRequired]);
  }

  addOfferingToArray() {
    return new FormGroup({
      amount: this.fb.control(0),
      category: this.fb.control(''),
      other: this.fb.control('')
    }, [this.giveValidator.offeringRequired, this.giveValidator.validateOffering, this.giveValidator.validateOfferingOther]);
  }

  deleteFromArray(index: number) {
    this.offerings.removeAt(index);
  }
}
