import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { DataService } from './services/data/data.service';
import { AppConstants } from './app.constant';
import { Utils } from './utils/util';
import { ReferenceDto } from './dto/reference.dto';
import { getDocs, query, where } from 'firebase/firestore';

@Injectable()
export class AppService {

  constructor(private dataService: DataService) {}

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  async getReferenceData(): Promise<ReferenceDto[]> {
    let refData;
    try {
      refData = await getDocs(query(this.dataService.collection('reference'), where('activeInd', '==', 'A')));
    } catch (error) {
      Logger.error(`Error getting documents: ${error}`);
      throw new BadRequestException('An error occurred', { cause: new Error(), description: 'error retrieving reference data' })
    }

    return refData.docs.map(doc => doc.data()).sort((a, b) => a.id - b.id) as ReferenceDto[];
  }
}
