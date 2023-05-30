import { Component, Input } from '@angular/core';
import { GivingFormService } from '../services/giving-form.service';
import { FormControl } from '@angular/forms';
import { GivingService } from '../services/giving.service';

@Component({
  selector: 'faith-giving-giving-details',
  templateUrl: './giving-details.component.html',
  styleUrls: ['./giving-details.component.css'],
})
export class GivingDetailsComponent {

  @Input() formSubmitted: boolean;

  get givingForm() { return this.formService.givingForm; }
  get offerings() { return this.formService.offerings; }

  get categories() { return this.givingService.categories; }

  constructor(
    private formService: GivingFormService,
    private givingService: GivingService
  ) { }

  addOffering() {
    this.offerings.push(this.formService.addOfferingToArray());
  }

  deleteOffering(index: number) {
    this.formService.deleteFromArray(index);
  }

  isOtherCategory(index: number) {
    let control = this.formService.offerings.controls[index].get('category') as FormControl;
    return control?.value == 6;
  }
  
}
