import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { VerifyComponent } from './verify.component';
import { CoreModule } from '../core/core.module';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
    { path: '', component: VerifyComponent }
];

@NgModule({
    declarations: [VerifyComponent],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        InputTextModule,
        CoreModule,
        HttpClientModule,
        RouterModule.forChild(routes)
    ]
})
export class VerifyModule {}
