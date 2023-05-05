import { EnvironmentInjector, Injectable } from '@angular/core';
import { BaseService } from '../../utils/base.service';
import { HttpClient } from '@angular/common/http';
import { Reference } from '../models/reference.model';
import { catchError } from 'rxjs';
import { GiveConstants } from '../giving.constants';
import { GrowlService } from '../../core/growl.service';

@Injectable()
export class GivingService extends BaseService {

  private _categories: Reference[] = [];
  get categories() { return this._categories; }
  set categories(value) { this._categories = value; }

  constructor(
    private http: HttpClient,
    protected override growlService: GrowlService
  ) {
    super(growlService);
  }

  getCategoryReferenceData() {
    const url = this.getApiUrl(GiveConstants.GIVE_REFERENCE_PATH);
    this.http.get(url)
      .pipe(catchError((err) => this.handleError(err)))
      .subscribe((data: Reference[]) => {
        this.categories = data;
    });
  }
}
