import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
    selector: 'faith-giving-verify',
    templateUrl: './verify.component.html',
    styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {

    verifyForm: FormGroup;
    loading = false;
    resending = false;
    formSubmitted = false;
    phone = '';

    get code() { return this.verifyForm.get('code'); }

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.phone = this.route.snapshot.queryParamMap.get('phone') ?? '';
        if (!this.phone) {
            this.router.navigate(['/']);
            return;
        }

        this.verifyForm = this.fb.group({
            code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
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
}
