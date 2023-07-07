import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserDetails } from '../models/giving.model';

@Component({
  selector: 'faith-giving-user-details-session',
  templateUrl: './user-details-session.component.html',
  styleUrls: ['./user-details-session.component.css'],
})
export class UserDetailsSessionComponent {

  @Input() userDetails: UserDetails;
  @Output() editClicked$: EventEmitter<UserDetails> = new EventEmitter();

  editButtonClicked() {
    this.editClicked$.next(this.userDetails);
  }
}
