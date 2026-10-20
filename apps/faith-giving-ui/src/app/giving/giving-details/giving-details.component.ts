import { GivingExperienceService } from '../../core/services/giving-experience.service';
import { HostBinding, Component, Input } from '@angular/core';
import { GivingFormService } from '../services/giving-form.service';
import { FormControl } from '@angular/forms';
import { GivingService } from '../services/giving.service';

@Component({
  selector: 'faith-giving-giving-details',
  templateUrl: './giving-details.component.html',
  styleUrls: [
    './giving-details.component.legacy.css',
    './giving-details.component.css',
  ],
})
export class GivingDetailsComponent {
  @HostBinding('class.redesign') get redesignEnabled() {
    return this.experience.enabled;
  }
  @HostBinding('class.legacy') get legacyEnabled() {
    return !this.experience.enabled;
  }

  @Input() formSubmitted: boolean;

  get givingForm() {
    return this.formService.givingForm;
  }
  get offerings() {
    return this.formService.offerings;
  }

  get categories() {
    return this.givingService.categories;
  }

  constructor(
    public readonly experience: GivingExperienceService,
    private formService: GivingFormService,
    private givingService: GivingService
  ) {}

  addOffering() {
    this.offerings.push(this.formService.addOfferingToArray());
  }

  deleteOffering(index: number) {
    this.formService.deleteFromArray(index);
  }

  isOtherCategory(index: number) {
    let control = this.formService.offerings.controls[index].get(
      'category'
    ) as FormControl;
    return control?.value == 7;
  }
}
