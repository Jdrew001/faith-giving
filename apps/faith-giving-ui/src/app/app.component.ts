import { DOCUMENT, Location } from '@angular/common';
import { GivingFlowService } from './core/services/giving-flow.service';
import { HostBinding, Component, Inject, OnInit } from '@angular/core';
import { AppVersionService } from './core/services/app-version.service';

@Component({
  selector: 'faith-giving-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  @HostBinding('class.redesign') readonly primaryTheme = true;

  title = 'faith-giving-ui';

  constructor(
    public readonly flow: GivingFlowService,
    private readonly location: Location,
    @Inject(DOCUMENT) private readonly document: Document,
    private appVersionService: AppVersionService
  ) {}

  ngOnInit(): void {
    const entry = new URLSearchParams(this.document.location?.search);
    if (entry.get('guest') === 'true') {
      this.flow.continueAsGuest(entry.get('phone') ?? '');
    }
    this.location.replaceState('/');
    this.appVersionService.initialize();
  }
}
