import * as XLSX from 'xlsx';
import { GivingExportDTO, GivingExportItem } from '../../dto/export.dto';

export class BaseExcel {
    
    getData(id: number, data: GivingExportDTO): GivingExportItem {
        return data.data.find(o => o.id == id);
    };
}