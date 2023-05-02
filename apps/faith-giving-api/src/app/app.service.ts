import { Injectable } from '@nestjs/common';
import { DataService } from './services/data/data.service';
import { ref, child, get } from "firebase/database";
import { AppConstants } from './app.constant';
import { Utils } from './utils/util';
import { ReferenceDto } from './dto/reference.dto';

@Injectable()
export class AppService {

  constructor(private dataService: DataService) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async getReferenceData(): Promise<ReferenceDto[]> {
    const offeringCategories = ref(this.dataService.getDatabase(), `${this.dataService.dbPath}/${AppConstants.OFFERINGS_REFERENCE_PATH}`);
    let data = await get(offeringCategories);
    let result = Utils.objectsToArray(data.val()) as ReferenceDto[];
    return data.exists() ? this.filterSortRefData(result) : [];
  }

  private filterSortRefData(data: ReferenceDto[]) {
    return data.filter(d => d.activeInd == 'A').sort((a, b) => a.value - b.value);
  }
}
