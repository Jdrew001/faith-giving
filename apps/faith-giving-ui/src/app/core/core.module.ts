import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrowlService } from './growl.service';
import {MessagesModule} from 'primeng/messages';
import {MessageModule} from 'primeng/message';
import { MessageService } from 'primeng/api';
import {ToastModule} from 'primeng/toast';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MessagesModule,
    MessageModule,
    ToastModule
  ],
  providers: [
    GrowlService,
    MessageService
  ],
  exports: [
    MessagesModule,
    MessageModule,
    ToastModule
  ]
})
export class CoreModule { }
