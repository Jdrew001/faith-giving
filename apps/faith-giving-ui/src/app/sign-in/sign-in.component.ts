import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
    selector: 'faith-giving-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {

    signInForm: FormGroup;
    verifyForm: FormGroup;
    loading = false;
    formSubmitted = false;
    codeSent = false;
    resending = false;
    phone = '';
    signInMessage = '';

    get phoneControl() { return this.signInForm.get('phone'); }
    get code() { return this.verifyForm.get('code'); }

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit() {
        this.signInForm = this.fb.group({
            phone: ['', [Validators.required, Validators.minLength(10)]]
        });
        this.verifyForm = this.fb.group({
            code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
        });

        this.authService.checkSession().then(found => {
            if (found && !this.codeSent) {
                this.router.navigate(['/give']);
            }
        });
    }

    sendCode() {
        this.formSubmitted = true;
        if (this.signInForm.invalid) return;

        const rawPhone = this.phoneControl.value as string;
        const normalized = rawPhone.replace(/\D/g, '');
        const e164Phone = normalized.startsWith('1') ? `+${normalized}` : `+1${normalized}`;
        this.phone = e164Phone;

        this.loading = true;
        this.authService.requestOtp(e164Phone).subscribe(result => {
            this.loading = false;
            if (!result) return;

            if (!result.found) {
                this.signInMessage = 'We could not find an account for that phone number. You can try another number or continue as guest.';
                return;
            }

            this.signInMessage = '';
            this.formSubmitted = false;
            this.codeSent = true;
        });
    }

    verify() {
        this.formSubmitted = true;
        if (this.verifyForm.invalid) return;

        this.loading = true;
        this.authService.verifyOtp(this.phone, this.code.value).subscribe(result => {
            this.loading = false;
            if (result?.success) {
                this.router.navigate(['/give']);
            }
        });
    }

    resendCode() {
        this.resending = true;
        this.authService.requestOtp(this.phone).subscribe(() => {
            this.resending = false;
        });
    }

    get maskedPhone(): string {
        if (!this.phone) return '';
        const digits = this.phone.replace(/\D/g, '');
        return `(${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-****`;
    }

    continueAsGuest() {
        this.router.navigate(['/give'], { queryParams: { guest: true } });
    }
}
