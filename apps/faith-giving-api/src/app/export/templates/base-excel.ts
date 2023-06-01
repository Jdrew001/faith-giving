import * as XLSX from 'xlsx';

export interface BaseExcel {
    generateSheet(): XLSX.WorkSheet;
}