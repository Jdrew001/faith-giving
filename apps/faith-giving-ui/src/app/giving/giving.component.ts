import { Component } from '@angular/core';

@Component({
  selector: 'faith-giving-giving',
  templateUrl: './giving.component.html',
  styleUrls: ['./giving.component.css'],
})
export class GivingComponent {

  offeringItems = [
    {
      id: 1,
      value: 'General Offering'
    }
  ]

  constructor() {}
}
