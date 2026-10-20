import { GivingExperienceService } from '../../core/services/giving-experience.service';
import { HostBinding, Component, EventEmitter, Input, Output } from '@angular/core';
import { GivingFormService } from '../services/giving-form.service';
import { bufferCount } from 'rxjs';

@Component({
  selector: 'faith-giving-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: [
    './user-details.component.legacy.css',
    './user-details.component.css',
  ],
})
export class UserDetailsComponent {
  @HostBinding('class.redesign') get redesignEnabled() {
    return this.experience.enabled;
  }
  @HostBinding('class.legacy') get legacyEnabled() {
    return !this.experience.enabled;
  }

  @Input() formSubmitted: boolean;
  @Output() onChange$: EventEmitter<any> = new EventEmitter();

  get givingForm() {
    return this.formService.givingForm;
  }

  constructor(
    public readonly experience: GivingExperienceService,
    private formService: GivingFormService
  ) {}

  ngOnInit() {}

  userChanged() {
    this.onChange$.next(true);
  }
}
