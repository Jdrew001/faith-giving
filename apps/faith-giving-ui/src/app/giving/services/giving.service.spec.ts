import { TestBed } from '@angular/core/testing';

import { GivingService } from './giving.service';

describe('GivingService', () => {
  let service: GivingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GivingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
