import { Controller, Get, Param, Res } from '@nestjs/common';
import { ExportService } from './export.service';
import { Response } from 'express';

@Controller('export')
export class ExportController {

    mockData = {
        "data": [
            {
                "name": "January",
                "id": 1,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            },
            {
                "name": "February",
                "id": 2,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            },
            {
                "name": "March",
                "id": 3,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            },
            {
                "name": "April",
                "id": 4,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            },
            {
                "name": "May",
                "id": 5,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            },
            {
                "name": "June",
                "id": 6,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            },
            {
                "name": "July",
                "id": 7,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            },
            {
                "name": "August",
                "id": 8,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            },
            {
                "name": "September",
                "id": 9,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            },
            {
                "name": "October",
                "id": 10,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            },
            {
                "name": "November",
                "id": 11,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            },
            {
                "name": "December",
                "id": 12,
                "weeks": ["", "", "$100.00", "", ""],
                "total": "$100.00"
            }
        ],
        "total": "$100.00"
    }

    constructor(
        private exportService: ExportService
    ) {}

    //http://localhost:3000/api/export/{type} example: GIVING or REPORT
    @Get("/:type")
    getExportReport(@Param() type: 'TITHE' | 'GIVING', @Res() response: Response) {
        let givingWorkbook = this.exportService.generateTitheExcel(this.mockData);
        response.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=giving_report.xlsx',
            'Content-Length': givingWorkbook.length.toString(),
          });
       
        response.send(givingWorkbook);
    }
}
