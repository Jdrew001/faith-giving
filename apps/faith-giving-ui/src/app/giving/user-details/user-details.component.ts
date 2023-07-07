import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GivingFormService } from '../services/giving-form.service';
import { bufferCount } from 'rxjs';

@Component({
  selector: 'faith-giving-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css'],
})
export class UserDetailsComponent {

  @Input() formSubmitted: boolean;
  @Output() onChange$: EventEmitter<any> = new EventEmitter();

  get givingForm() { return this.formService.givingForm; }

  constructor(
    private formService: GivingFormService,
  ) { }

  ngOnInit() {
  }

  userChanged() {
    this.onChange$.next(true);
  }
}
