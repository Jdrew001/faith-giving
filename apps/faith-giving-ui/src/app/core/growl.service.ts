import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable()
export class GrowlService {

  constructor(
    private messageService: MessageService
  ) { }

  showErrorMessage(message: string) {
    this.messageService.add({ severity: 'error', summary: "Failure", detail: message });
  }

  showSuccessMessage(message: string) {
    this.messageService.add({ severity: 'success', summary: "Success", detail: message });
  }
}
