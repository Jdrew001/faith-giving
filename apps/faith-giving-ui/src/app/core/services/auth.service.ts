import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, EMPTY, tap } from 'rxjs';
import { BaseService } from '../../utils/base.service';
import { GrowlService } from '../growl.service';
import { UserDetails } from '../../giving/models/giving.model';

export const AUTH_CONSTANTS = {
    REQUEST_OTP: 'api/auth/requestOtp',
    VERIFY_OTP: 'api/auth/verifyOtp',
    SIGN_OUT: 'api/auth/signOut',
    FETCH_INDIVIDUAL: 'api/individual/individualBySession',
    UPDATE_PROFILE: 'api/individual/profile'
};

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService {

    private _individual = new BehaviorSubject<UserDetails | null>(null);
    individual$ = this._individual.asObservable();

    get individual() { return this._individual.value; }
    get isAuthenticated() { return !!this._individual.value; }

    constructor(
        private http: HttpClient,
        protected override growlService: GrowlService,
        private router: Router
    ) {
        super(growlService);
    }

    setIndividual(details: UserDetails | null) {
        this._individual.next(details);
    }

    requestOtp(phone: string): Observable<{ success: boolean; found: boolean }> {
        const url = this.getApiUrl(AUTH_CONSTANTS.REQUEST_OTP);
        return this.http.post<{ success: boolean; found: boolean }>(url, { phone })
            .pipe(catchError(err => { this.handleError(err); return EMPTY; }));
    }

    verifyOtp(phone: string, code: string): Observable<{ success: boolean; data: UserDetails }> {
        const url = this.getApiUrl(AUTH_CONSTANTS.VERIFY_OTP);
        return this.http.post<{ success: boolean; data: UserDetails }>(url, { phone, code }, { withCredentials: true })
            .pipe(
                tap(result => {
                    if (result.success) {
                        this._individual.next(result.data);
                    }
                }),
                catchError(err => { this.handleError(err); return EMPTY; })
            );
    }

    checkSession(): Promise<UserDetails | null> {
        const url = this.getApiUrl(AUTH_CONSTANTS.FETCH_INDIVIDUAL);
        return new Promise(resolve => {
            this.http.get<{ success: boolean; data: UserDetails }>(url, { withCredentials: true })
                .subscribe({
                    next: result => {
                        if (result?.data) {
                            this._individual.next(result.data);
                            resolve(result.data);
                        } else {
                            resolve(null);
                        }
                    },
                    error: () => resolve(null)
                });
        });
    }
updateProfile(data: { firstname: string; lastname: string; email: string; phone: string }): Observable<{ success: boolean; data: UserDetails }> {
        const url = this.getApiUrl(AUTH_CONSTANTS.UPDATE_PROFILE);
        return this.http.put<{ success: boolean; data: UserDetails }>(url, data, { withCredentials: true })
            .pipe(
                tap(result => {
                    if (result.success) {
                        this._individual.next(result.data);
                    }
                }),
                catchError(err => { this.handleError(err); return EMPTY; })
            );
    }

    
    signOut(): void {
        const url = this.getApiUrl(AUTH_CONSTANTS.SIGN_OUT);
        this.http.post(url, {}, { withCredentials: true })
            .pipe(catchError(err => { this.handleError(err); return EMPTY; }))
            .subscribe(() => {
                this._individual.next(null);
                this.router.navigate(['/']);
            });
    }
}
