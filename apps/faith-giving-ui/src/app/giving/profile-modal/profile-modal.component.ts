import {
  HostBinding,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { GrowlService } from '../../core/growl.service';
import { finalize } from 'rxjs';
import { PaymentMethod } from '../models/giving.model';
import { GivingService } from '../services/giving.service';

@Component({
  selector: 'faith-giving-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css'],
})
export class ProfileModalComponent implements OnInit, OnChanges {
  @HostBinding('class.redesign') readonly primaryTheme = true;

  @Input() visible: boolean = false;
  @Input() individual: any;
  @Output() closeModal = new EventEmitter<void>();

  profileForm: FormGroup;
  loading = false;
  formSubmitted = false;
  paymentMethods: PaymentMethod[] = [];
  loadingPaymentMethods = false;
  paymentMethodsError = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private growlService: GrowlService,
    private givingService: GivingService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit() {
    this.prefill();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['visible']?.currentValue === true) {
      this.formSubmitted = false;
      this.prefill();
      this.fetchPaymentMethods();
    }
  }

  fetchPaymentMethods() {
    this.paymentMethods = [];
    this.paymentMethodsError = false;
    this.loadingPaymentMethods = true;
    this.givingService
      .fetchPaymentMethods()
      .pipe(
        finalize(() => {
          this.loadingPaymentMethods = false;
        })
      )
      .subscribe({
        next: (result) => {
          if (result?.success && Array.isArray(result.data)) {
            this.paymentMethods = result.data;
          } else {
            this.paymentMethodsError = true;
          }
        },
        error: () => {
          this.paymentMethodsError = true;
        },
      });
  }

  deletePaymentMethod(id: string) {
    this.givingService.deletePaymentMethod(id).subscribe({
      next: (result) => {
        if (result?.success) {
          this.growlService.showSuccessMessage('Payment method removed');
          this.fetchPaymentMethods();
        }
      },
      error: () => {
        this.growlService.showErrorMessage('Failed to remove payment method');
      },
    });
  }

  private prefill() {
    const ind = this.individual ?? this.authService.individual;
    if (ind) {
      const digits = (ind.phone ?? '').replace(/\D/g, '');
      const phone =
        digits.length === 11 && digits.startsWith('1')
          ? digits.slice(1)
          : digits;
      this.profileForm.patchValue({
        firstName: ind.firstname,
        lastName: ind.lastname,
        email: ind.email,
        phone,
      });
    }
  }

  saveProfile() {
    this.formSubmitted = true;
    if (this.profileForm.invalid) return;

    this.loading = true;
    const { firstName, lastName, email, phone } = this.profileForm.value;

    const rawPhone = phone;
    const normalized = rawPhone.replace(/\D/g, '');
    const e164Phone = normalized.startsWith('1')
      ? `+${normalized}`
      : `+1${normalized}`;

    this.authService
      .updateProfile({
        firstname: firstName,
        lastname: lastName,
        email: email,
        phone: e164Phone,
      })
      .subscribe((result) => {
        this.loading = false;
        if (result?.success) {
          this.growlService.showSuccessMessage('Profile updated successfully');
          this.dismiss();
        }
      });
  }

  dismiss() {
    this.visible = false;
    this.formSubmitted = false;
    this.profileForm.reset();
    this.closeModal.emit();
  }
}
