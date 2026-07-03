import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { GrowlService } from '../../core/growl.service';
import { HttpClient } from '@angular/common/http';
import { GiveConstants } from '../giving.constants';

@Component({
  selector: 'faith-giving-profile-modal',
  templateUrl: './profile-modal.component.html',
  styleUrls: ['./profile-modal.component.css']
})
export class ProfileModalComponent implements OnInit, OnChanges {

  @Input() visible: boolean = false;
  @Input() individual: any;
  @Output() closeModal = new EventEmitter<void>();

  profileForm: FormGroup;
  loading = false;
  formSubmitted = false;
  paymentMethods: any[] = [];
  loadingPaymentMethods = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private growlService: GrowlService,
    private http: HttpClient
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10)]]
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
    this.loadingPaymentMethods = true;
    this.http.get<{success: boolean, data: any[]}>(GiveConstants.PAYMENT_METHODS, { withCredentials: true })
      .subscribe({
        next: (result) => {
          if (result?.success) {
            this.paymentMethods = result.data;
          }
        },
        error: () => {
          this.paymentMethods = [];
        }
      }).add(() => {
        this.loadingPaymentMethods = false;
      });
  }

  deletePaymentMethod(id: string) {
    this.http.delete<{success: boolean}>(`${GiveConstants.PAYMENT_METHODS}/${id}`, { withCredentials: true })
      .subscribe({
        next: (result) => {
          if (result?.success) {
            this.growlService.showSuccessMessage('Payment method removed');
            this.fetchPaymentMethods();
          }
        },
        error: () => {
          this.growlService.showErrorMessage('Failed to remove payment method');
        }
      });
  }

  private prefill() {
    const ind = this.individual ?? this.authService.individual;
    if (ind) {
      this.profileForm.patchValue({
        firstName: ind.firstname,
        lastName: ind.lastname,
        email: ind.email,
        phone: ind.phone
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
    const e164Phone = normalized.startsWith('1') ? `+${normalized}` : `+1${normalized}`;

    this.authService.updateProfile({
      firstname: firstName,
      lastname: lastName,
      email: email,
      phone: e164Phone
    }).subscribe(result => {
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
