import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable()
export class GrowlService {

  constructor(
    private messageService: MessageService
  ) { }

  showErrorMessage(message: string, title?:string) {
    this.messageService.add({ severity: 'error', summary: title? title: 'Failure', detail: message, sticky: true });
  }

  showSuccessMessage(message: string) {
    this.messageService.add({ severity: 'success', summary: "Success", detail: message, sticky: true });
  }
}
