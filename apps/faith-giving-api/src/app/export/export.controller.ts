import { Controller, Get, Param } from '@nestjs/common';
import { ExportService } from './export.service';

@Controller('export')
export class ExportController {

    constructor(
        private exportService: ExportService
    ) {}

    @Get("/:type")
    getExportReport(@Param() type: 'GIVING' | 'REPORT') {
        // pass the type to the service
    }
}
