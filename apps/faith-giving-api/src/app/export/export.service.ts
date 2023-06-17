import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as XLSX from '@sheet/core';
import { GivingSheet } from './templates/giving-excel';
import { GivingExportDTO } from '../dto/export.dto';

@Injectable()
export class ExportService {

    generateGivingExcel(data: GivingExportDTO) {
        let result;
        try {
            let workbook = XLSX.utils.book_new();
            const template = new GivingSheet(data).generateSheet();
    
            XLSX.utils.book_append_sheet(workbook, template, 'Sheet1');
            result = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', cellStyles: true });
        } catch(e) {
            throw new BadRequestException('An error occurred', { cause: e, description: 'giving report failure' });
        }
        
        Logger.log(XLSX.version);
        return result;
    }
}
