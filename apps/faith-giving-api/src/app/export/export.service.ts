import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSXStyle from 'xlsx-style';
import * as XLSX from 'xlsx';
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
            workbook = this.styleTitheWorkbook(workbook);
            result = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        } catch(e) {
            throw new BadRequestException('An error occurred', { cause: e, description: 'giving report failure' });
        }
        

        return result;
    }

    styleTitheWorkbook(workbook) {
        let sheetName = workbook.SheetNames[0];
        let sheet = workbook.Sheets[sheetName];
        let titleCellAddress = 'C4';
        //style heading
        let style = {
            font: { bold: true },
            alignment: { horizontal: 'center', vertical: 'center' },
        }
        const cellAddress = { r: 3, c: 2 };
        const cellIndex = XLSXStyle.utils.encode_cell(cellAddress);
        sheet[cellIndex] = { ...sheet[cellIndex], s: style };

        return workbook;
    }
}
