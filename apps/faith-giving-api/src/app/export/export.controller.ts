import { Controller, Get, Param, Res } from '@nestjs/common';
import { ExportService } from './export.service';
import { Response } from 'express';

@Controller('export')
export class ExportController {

    constructor(
        private exportService: ExportService
    ) {}

    @Get("/:type")
    getExportReport(@Param() type: 'GIVING' | 'REPORT', @Res() response: Response) {
        let givingWorkbook = this.exportService.generateGivingExcel();
        response.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=giving_report.xlsx',
            'Content-Length': givingWorkbook.length.toString(),
          });
       
        response.send(givingWorkbook);
    }
}
