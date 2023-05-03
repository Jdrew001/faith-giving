import { Component, Input } from '@angular/core';
import { GivingFormService } from '../services/giving-form.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'faith-giving-giving-details',
  templateUrl: './giving-details.component.html',
  styleUrls: ['./giving-details.component.css'],
})
export class GivingDetailsComponent {

  @Input() formSubmitted: boolean;

  get givingForm() { return this.formService.givingForm; }
  get offerings() { return this.formService.offerings; }

  offeringItems = [
    {
      id: 1,
      value: 'General Offering'
    },
     {
      id: 2,
      value: 'Other'
    }
  ]

  constructor(
    private formService: GivingFormService,
  ) { }

  addOffering() {
    this.offerings.push(this.formService.addOfferingToArray());
  }

  deleteOffering(index: number) {
    this.formService.deleteFromArray(index);
  }

  isOtherCategory(index: number) {
    let control = this.formService.offerings.controls[index].get('category') as FormControl;

    console.log('Control', control.value)
    return control.value?.value === 'Other';
  }
  
}
