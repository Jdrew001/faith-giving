import { MessageService } from 'primeng/api';
import { TestBed } from '@angular/core/testing';

import { GrowlService } from './growl.service';

describe('GrowlService', () => {
  let service: GrowlService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GrowlService, MessageService],
    });
    service = TestBed.inject(GrowlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
