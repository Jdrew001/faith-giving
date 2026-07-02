import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { SignInComponent } from './sign-in.component';
import { CoreModule } from '../core/core.module';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
    { path: '', component: SignInComponent }
];

@NgModule({
    declarations: [SignInComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        NgxMaskDirective,
        NgxMaskPipe,
        CoreModule,
        HttpClientModule,
        RouterModule.forChild(routes)
    ],
    providers: [provideNgxMask()]
})
export class SignInModule {}
