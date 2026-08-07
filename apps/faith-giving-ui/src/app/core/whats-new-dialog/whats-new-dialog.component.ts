import { Component } from '@angular/core';

import { AppVersionService, WhatsNewItem } from '../services/app-version.service';

@Component({
  selector: 'app-whats-new-dialog',
  templateUrl: './whats-new-dialog.component.html',
  styleUrls: ['./whats-new-dialog.component.css'],
})
export class WhatsNewDialogComponent {
  whatsNew$ = this.appVersionService.whatsNew$;

  constructor(private appVersionService: AppVersionService) {}

  dismiss(): void {
    this.appVersionService.dismissCurrentVersion();
  }

  trackByTitle(_index: number, item: WhatsNewItem): string {
    return item.title;
  }
}
