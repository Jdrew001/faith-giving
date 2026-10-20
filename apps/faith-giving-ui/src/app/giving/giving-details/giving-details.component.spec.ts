import { GivingExperienceService } from '../../core/services/giving-experience.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DropdownModule } from 'primeng/dropdown';
import { GivingFormService } from '../services/giving-form.service';
import { GivingService } from '../services/giving.service';
import { GivingDetailsComponent } from './giving-details.component';

describe('GivingDetailsComponent', () => {
  let fixture: ComponentFixture<GivingDetailsComponent>;
  let form: GivingFormService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GivingDetailsComponent],
      imports: [ReactiveFormsModule, DropdownModule, NoopAnimationsModule],
      providers: [
        {
          provide: GivingExperienceService,
          useValue: {
            enabled: true,
            lockGift: jest.fn(),
            releaseGift: jest.fn(),
          },
        },
        GivingFormService,
        {
          provide: GivingService,
          useValue: { categories: [{ id: 7, label: 'Other' }] },
        },
      ],
    }).compileComponents();
    form = TestBed.inject(GivingFormService);
    form.createGivingForm();
    fixture = TestBed.createComponent(GivingDetailsComponent);
    fixture.detectChanges();
  });

  it('shows the description input for an Other offering and binds it to the gift', () => {
    fixture.componentInstance.addOffering();
    form.offerings.at(0).patchValue({ amount: '$25.00', category: 7 });
    fixture.componentInstance.formSubmitted = true;
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('#offering-description-0')
    ).toBeTruthy();
    form.offerings.at(0).patchValue({ other: 'Building fund' });
    fixture.detectChanges();
    expect(form.offerings.at(0).get('other')?.value).toBe('Building fund');
  });
});
