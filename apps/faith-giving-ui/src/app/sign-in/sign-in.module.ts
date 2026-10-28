import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { SignInComponent } from './sign-in.component';
import { CoreModule } from '../core/core.module';
import { HttpClientModule } from '@angular/common/http';

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
  ],
  exports: [SignInComponent],
  providers: [provideNgxMask()],
})
export class SignInModule {}
