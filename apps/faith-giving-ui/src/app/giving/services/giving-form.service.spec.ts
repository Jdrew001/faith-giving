import { TestBed } from '@angular/core/testing';

import { GivingFormService } from './giving-form.service';

describe('GivingFormService', () => {
  let service: GivingFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GivingFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
