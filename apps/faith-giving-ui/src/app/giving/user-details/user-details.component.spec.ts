import { GivingExperienceService } from '../../core/services/giving-experience.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { GivingFormService } from '../services/giving-form.service';
import { UserDetailsComponent } from './user-details.component';

describe('UserDetailsComponent', () => {
  let fixture: ComponentFixture<UserDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UserDetailsComponent],
      imports: [ReactiveFormsModule, NgxMaskDirective],
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
        provideNgxMask(),
      ],
    }).compileComponents();
    TestBed.inject(GivingFormService).createGivingForm();
    fixture = TestBed.createComponent(UserDetailsComponent);
    fixture.detectChanges();
  });

  it('associates personal detail labels and shows submitted validation errors', () => {
    fixture.componentInstance.formSubmitted = true;
    fixture.detectChanges();
    const email = fixture.nativeElement.querySelector(
      '#giving-email'
    ) as HTMLInputElement;
    expect(email.labels?.[0].textContent).toContain('Email address');
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.textContent).toContain(
      'A valid email address is required'
    );
  });
});
