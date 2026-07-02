import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { GiveFormValidator } from '../validators/give-validator';
import { UserDetails } from '../models/giving.model';

@Injectable()
export class GivingFormService {

  givingForm: FormGroup;
  giveValidator = new GiveFormValidator()

  get offerings() { return this.givingForm.controls['offerings'] as FormArray; }

  get email() { return this.givingForm.controls['email']; }
  get firstName() { return this.givingForm.controls['firstName']; }
  get lastName() { return this.givingForm.controls['lastName']; }
  get phone() { return this.givingForm.controls['phone']; }

  get tithe() { return this.givingForm.controls['tithe']; }
  get feeCovered() { return this.givingForm.controls['feeCovered']; }
  constructor(
    private fb: FormBuilder
  ) { }

  updateUserFields(userDetails: UserDetails) {
    this.firstName.setValue(userDetails?.firstname);
    this.lastName.setValue(userDetails?.lastname);
    this.email.setValue(userDetails?.email);
    this.phone.setValue(userDetails?.phone);
  }

  disablePersonalFieldValidators() {
    this.email.clearValidators();
    this.firstName.clearValidators();
    this.lastName.clearValidators();
    this.phone.clearValidators();
    this.email.updateValueAndValidity();
    this.firstName.updateValueAndValidity();
    this.lastName.updateValueAndValidity();
    this.phone.updateValueAndValidity();
  }

  enablePersonalFieldValidators() {
    this.email.setValidators([Validators.required, Validators.email]);
    this.firstName.setValidators([Validators.required]);
    this.lastName.setValidators([Validators.required]);
    this.phone.setValidators([Validators.required]);
    this.email.updateValueAndValidity();
    this.firstName.updateValueAndValidity();
    this.lastName.updateValueAndValidity();
    this.phone.updateValueAndValidity();
  }

  createGivingForm() {
    this.givingForm = new FormGroup({
      email: this.fb.control('', [Validators.required, Validators.email]),
      firstName: this.fb.control('', [Validators.required]),
      lastName: this.fb.control('', [Validators.required]),
      phone: this.fb.control('', [Validators.required]),
      tithe: this.fb.control('$0.00'),
      offerings: this.fb.array([]),
      feeCovered: this.fb.control(false)
    }, [this.giveValidator.oneRequired]);
  }

  addOfferingToArray() {
    return new FormGroup({
      amount: this.fb.control('$0.00'),
      category: this.fb.control(null, [Validators.required]),
      other: this.fb.control('')
    }, [this.giveValidator.offeringRequired, this.giveValidator.validateOffering, this.giveValidator.validateOfferingOther]);
  }

  deleteFromArray(index: number) {
    this.offerings.removeAt(index);
  }
}
