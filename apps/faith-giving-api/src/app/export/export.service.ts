import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { GivingSheet } from './templates/giving-excel';

@Injectable()
export class ExportService {

    generateGivingExcel() {
        let result;
        try {
            const workbook = XLSX.utils.book_new();
            const template = new GivingSheet();
    
            XLSX.utils.book_append_sheet(workbook, template, 'Sheet1');
            result = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        } catch(e) {
            throw new BadRequestException('An error occurred', { cause: e, description: 'giving report failure' });
        }
        

        return result;
    }
}
