import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { GivingFormService } from './giving-form.service';
import { GrowlService } from '../../core/growl.service';
import { TestBed } from '@angular/core/testing';

import { GivingService } from './giving.service';

describe('GivingService', () => {
  let service: GivingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      providers: [
        GivingService,
        GivingFormService,
        CookieService,
        { provide: GrowlService, useValue: { showErrorMessage: jest.fn() } },
      ],
    });
    service = TestBed.inject(GivingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
