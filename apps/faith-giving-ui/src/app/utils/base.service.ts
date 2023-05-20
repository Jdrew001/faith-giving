import { EMPTY } from "rxjs";
import { BaseConstants } from "./base.constants";
import { GrowlService } from '../core/growl.service';

export class BaseService {
    protected BASE_URL = process.env['NODE_ENV'] == 'development' ? BaseConstants.DEV_URL : BaseConstants.PROD_URL;

    constructor(
        protected growlService: GrowlService
    ) {}

    protected getApiUrl(path: string) {
        return this.BASE_URL + path;
    }

    protected handleError(error: any) {
        console.error(error);
        this.growlService.showErrorMessage(error.message);
        return EMPTY;
    }
}