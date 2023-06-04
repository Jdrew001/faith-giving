import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { GivingSheet } from './templates/giving-excel';

@Injectable()
export class ExportService {

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

    generateGivingExcel() {
        let result;
        try {
            const workbook = XLSX.utils.book_new();
            const template = new GivingSheet().generateSheet();
    
            XLSX.utils.book_append_sheet(workbook, template, 'Sheet1');
            result = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        } catch(e) {
            throw new BadRequestException('An error occurred', { cause: e, description: 'giving report failure' });
        }
        

        return result;
    }
}
