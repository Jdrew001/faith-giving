import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { GrowlService } from './growl.service';
import { AuthService } from './services/auth.service';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { StripeService } from './services/stripe.service';
import { CurrencyMaskDirective } from './directives/currency-mask.directive';
import { CookieService } from 'ngx-cookie-service';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { WhatsNewDialogComponent } from './whats-new-dialog/whats-new-dialog.component';

@NgModule({
  declarations: [CurrencyMaskDirective, HeaderComponent, FooterComponent, WhatsNewDialogComponent],
  imports: [CommonModule, HttpClientModule, RouterModule, MessagesModule, MessageModule, ToastModule, DialogModule, ButtonModule],
  providers: [GrowlService, MessageService, StripeService, CookieService],
  exports: [
    MessagesModule,
    MessageModule,
    ToastModule,
    CurrencyMaskDirective,
    HeaderComponent,
    FooterComponent,
    WhatsNewDialogComponent,
  ],
})
export class CoreModule {}
